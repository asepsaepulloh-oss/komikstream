import { SignUp } from "@clerk/nextjs";
import { isClerkConfigured } from "@/lib/auth-config";
import { AuthNotConfigured } from "@/components/ui/AuthNotConfigured";

export default function SignUpPage() {
  const clerkEnabled = isClerkConfigured();

  if (!clerkEnabled) {
    return <AuthNotConfigured />;
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
      <SignUp
        appearance={{
          elements: {
            formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground",
            card: "bg-card border border-border shadow-lg",
            headerTitle: "text-foreground",
            headerSubtitle: "text-muted-foreground",
            socialButtonsBlockButton:
              "bg-secondary hover:bg-secondary/80 text-secondary-foreground border-border",
            formFieldLabel: "text-foreground",
            formFieldInput: "bg-background border-input text-foreground focus:ring-ring",
            footerActionLink: "text-primary hover:text-primary/90",
          },
        }}
      />
    </div>
  );
}
