import { auth, currentUser } from "@clerk/nextjs/server";
import { findUserByClerkId, upsertUser, DatabaseUnavailableError } from "@/lib/db";

export interface DbUser {
  id: string;
  clerkId: string;
  email: string;
  name: string | null;
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Get or create a user in the database based on Clerk authentication.
 * Returns null if not authenticated or DB is unavailable.
 */
export async function getOrCreateUser(): Promise<DbUser | null> {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    return null;
  }

  try {
    // Try to find existing user
    let user = await findUserByClerkId(clerkId);

    // If user doesn't exist, create from Clerk data
    if (!user) {
      const clerkUser = await currentUser();

      if (!clerkUser) {
        return null;
      }

      const email = clerkUser.emailAddresses?.[0]?.emailAddress;
      if (!email) {
        return null;
      }

      const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || null;

      try {
        user = await upsertUser({
          clerkId,
          email,
          name,
          imageUrl: clerkUser.imageUrl || null,
        });
      } catch (error) {
        // Final fallback: try to fetch again (race condition with webhook)
        console.error("Error creating user, trying to fetch again:", error);
        user = await findUserByClerkId(clerkId);
      }
    }

    return user;
  } catch (error) {
    if (error instanceof DatabaseUnavailableError) {
      return null;
    }
    throw error;
  }
}

/**
 * Get user by Clerk ID
 */
export async function getUserByClerkId(clerkId: string): Promise<DbUser | null> {
  try {
    return await findUserByClerkId(clerkId);
  } catch (error) {
    if (error instanceof DatabaseUnavailableError) {
      return null;
    }
    throw error;
  }
}

/**
 * Update user information from Clerk
 */
export async function syncUserFromClerk(clerkId: string): Promise<DbUser | null> {
  const clerkUser = await currentUser();
  if (!clerkUser || clerkUser.id !== clerkId) {
    return null;
  }

  const email = clerkUser.emailAddresses?.[0]?.emailAddress;
  const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || null;

  try {
    return await upsertUser({
      clerkId,
      email: email || `${clerkId}@temp.local`,
      name,
      imageUrl: clerkUser.imageUrl || null,
    });
  } catch (error) {
    if (error instanceof DatabaseUnavailableError) {
      return null;
    }
    throw error;
  }
}
