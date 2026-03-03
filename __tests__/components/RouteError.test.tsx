/**
 * Tests for src/components/ui/RouteError.tsx
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { RouteError } from "@/components/ui/RouteError";
import { BookOpen } from "lucide-react";

describe("RouteError", () => {
  const defaultProps = {
    error: Object.assign(new Error("Something went wrong"), { digest: "abc123" }),
    reset: jest.fn(),
    title: "Komik Error",
    description: "Gagal memuat halaman komik.",
    routeHref: "/komik",
    routeLabel: "Daftar Komik",
    RouteIcon: BookOpen,
  };

  beforeEach(() => {
    defaultProps.reset.mockClear();
  });

  it("renders title and description", () => {
    render(<RouteError {...defaultProps} />);

    expect(screen.getByText("Komik Error")).toBeInTheDocument();
    expect(screen.getByText("Gagal memuat halaman komik.")).toBeInTheDocument();
  });

  it("displays error message", () => {
    render(<RouteError {...defaultProps} />);

    expect(screen.getByText("Error: Something went wrong")).toBeInTheDocument();
  });

  it("does not display error message block when message is empty", () => {
    const props = {
      ...defaultProps,
      error: Object.assign(new Error(""), {}),
    };
    render(<RouteError {...props} />);

    expect(screen.queryByText(/^Error:/)).not.toBeInTheDocument();
  });

  it("calls reset when retry button is clicked", () => {
    render(<RouteError {...defaultProps} />);

    fireEvent.click(screen.getByText("Coba Lagi"));
    expect(defaultProps.reset).toHaveBeenCalledTimes(1);
  });

  it("renders route link with correct href and label", () => {
    render(<RouteError {...defaultProps} />);

    const routeLink = screen.getByText("Daftar Komik");
    expect(routeLink.closest("a")).toHaveAttribute("href", "/komik");
  });

  it("renders Beranda link pointing to /", () => {
    render(<RouteError {...defaultProps} />);

    const homeLink = screen.getByText("Beranda");
    expect(homeLink.closest("a")).toHaveAttribute("href", "/");
  });
});
