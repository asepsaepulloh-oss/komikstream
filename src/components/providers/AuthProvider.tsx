"use client";

import { ClerkProvider, useAuth as useClerkAuth } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";
import { createContext, useContext, type ReactNode } from "react";
import { useMounted } from "@/hooks/useMounted";

// ── Auth context ──────────────────────────────────────────────────────
// Exposes a minimal { isSignedIn, isLoaded } contract that works
// regardless of whether Clerk is configured.  Components such as
// useSync consume this context instead of importing useAuth from
// @clerk/nextjs directly, which would throw when ClerkProvider is
// absent from the tree.

export interface AuthState {
  isSignedIn: boolean;
  isLoaded: boolean;
}

const AuthContext = createContext<AuthState>({
  isSignedIn: false,
  isLoaded: true,
});

/**
 * Safe replacement for Clerk's useAuth().
 * Returns { isSignedIn, isLoaded } from the nearest AuthProvider.
 * Never throws, even when Clerk is not configured.
 */
export function useAuthState(): AuthState {
  return useContext(AuthContext);
}

// ── Internal helpers ──────────────────────────────────────────────────

interface AuthProviderProps {
  children: ReactNode;
  clerkEnabled: boolean;
}

/**
 * Bridges Clerk's useAuth() into our AuthContext so downstream
 * consumers don't need a direct Clerk dependency.
 */
function ClerkAuthBridge({ children }: { children: ReactNode }) {
  const { isSignedIn, isLoaded } = useClerkAuth();
  return (
    <AuthContext.Provider value={{ isSignedIn: isSignedIn ?? false, isLoaded }}>
      {children}
    </AuthContext.Provider>
  );
}

function ClerkProviderWithTheme({ children }: { children: ReactNode }) {
  const { resolvedTheme } = useTheme();
  const mounted = useMounted();

  // Always wrap in ClerkProvider, but only apply theme after mount
  // This ensures SignedIn/SignedOut components always have a ClerkProvider parent
  return (
    <ClerkProvider
      appearance={{
        baseTheme: mounted && resolvedTheme === "dark" ? dark : undefined,
        variables: {
          colorPrimary: "hsl(263 70% 50%)",
        },
      }}
      signInFallbackRedirectUrl="/"
      signUpFallbackRedirectUrl="/"
    >
      <ClerkAuthBridge>{children}</ClerkAuthBridge>
    </ClerkProvider>
  );
}

export function AuthProvider({ children, clerkEnabled }: AuthProviderProps) {
  // If Clerk is not configured, provide a static "not signed in" context
  if (!clerkEnabled) {
    return (
      <AuthContext.Provider value={{ isSignedIn: false, isLoaded: true }}>
        {children}
      </AuthContext.Provider>
    );
  }

  return <ClerkProviderWithTheme>{children}</ClerkProviderWithTheme>;
}
