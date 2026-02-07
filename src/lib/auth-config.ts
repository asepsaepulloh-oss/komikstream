// Check if Clerk is properly configured
export function isClerkConfigured(): boolean {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  // Check if key exists and is not a placeholder
  if (!publishableKey) return false;
  if (publishableKey === "pk_test_placeholder") return false;
  if (!publishableKey.startsWith("pk_")) return false;

  return true;
}

// Export for use in components
export const CLERK_ENABLED =
  typeof process !== "undefined" &&
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY !== "pk_test_placeholder" &&
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.startsWith("pk_");
