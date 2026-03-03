/**
 * Tests for src/components/ui/AuthNotConfigured.tsx
 */

import { render, screen } from "@testing-library/react";
import { AuthNotConfigured } from "@/components/ui/AuthNotConfigured";

describe("AuthNotConfigured", () => {
  it("renders the title", () => {
    render(<AuthNotConfigured />);
    expect(screen.getByText("Authentication Not Configured")).toBeInTheDocument();
  });

  it("renders the description text", () => {
    render(<AuthNotConfigured />);
    expect(screen.getByText(/Clerk authentication is not yet configured/)).toBeInTheDocument();
  });

  it("renders setup instructions list", () => {
    render(<AuthNotConfigured />);
    expect(screen.getByText("Create a Clerk account at clerk.com")).toBeInTheDocument();
    expect(screen.getByText("Get your API keys from the dashboard")).toBeInTheDocument();
    expect(screen.getByText("Add them to your .env file")).toBeInTheDocument();
    expect(screen.getByText("Restart the development server")).toBeInTheDocument();
  });

  it("renders back link pointing to /", () => {
    render(<AuthNotConfigured />);
    const backLink = screen.getByText("Kembali ke Beranda");
    expect(backLink.closest("a")).toHaveAttribute("href", "/");
  });
});
