import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createUser, upsertUser, deleteUserByClerkId, UniqueConstraintError } from "@/lib/db";
import { handleApiError } from "@/lib/api-helpers";
import { ValidationError, FeatureNotConfiguredError } from "@/lib/errors";
import { logger } from "@/lib/logger";

export async function POST(req: Request) {
  // Get the webhook secret from environment
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    logger.error("Missing CLERK_WEBHOOK_SECRET environment variable");
    return new FeatureNotConfiguredError("Webhook secret").toResponse();
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new ValidationError("Missing svix headers").toResponse();
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Verify the payload with the headers
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    logger.error("Webhook signature verification failed", err);
    return new ValidationError("Invalid webhook signature").toResponse();
  }

  const eventType = evt.type;

  try {
    switch (eventType) {
      case "user.created": {
        const { id, email_addresses, first_name, last_name, image_url } = evt.data;

        const email = email_addresses?.[0]?.email_address;
        const name = [first_name, last_name].filter(Boolean).join(" ") || null;

        if (!email) {
          logger.warn("No email found for user in webhook", { clerkId: id });
          return new ValidationError("No email found for user").toResponse();
        }

        try {
          await createUser({ clerkId: id, email, name, imageUrl: image_url || null });
        } catch (error) {
          // Handle race condition: user may already exist from getOrCreateUser()
          if (error instanceof UniqueConstraintError) {
            await upsertUser({ clerkId: id, email, name, imageUrl: image_url || null });
          } else {
            throw error;
          }
        }

        logger.info("User created via webhook", { clerkId: id });
        break;
      }

      case "user.updated": {
        const { id, email_addresses, first_name, last_name, image_url } = evt.data;

        const email = email_addresses?.[0]?.email_address;
        const name = [first_name, last_name].filter(Boolean).join(" ") || null;

        await upsertUser({
          clerkId: id,
          email: email || `${id}@placeholder.clerk`,
          name,
          imageUrl: image_url || null,
        });

        logger.info("User updated via webhook", { clerkId: id });
        break;
      }

      case "user.deleted": {
        const { id } = evt.data;

        if (!id) {
          logger.warn("No user ID found in delete webhook event");
          return new ValidationError("No user ID found in delete event").toResponse();
        }

        await deleteUserByClerkId(id);
        logger.info("User deleted via webhook", { clerkId: id });
        break;
      }

      default:
        logger.debug("Unhandled webhook event", { eventType });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error, `webhook/${eventType}`);
  }
}
