/**
 * Tests for src/components/ui/ErrorDisplay.tsx
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { ErrorDisplay } from "@/components/ui/ErrorDisplay";

// Access the mocked router
const mockRefresh = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: mockRefresh,
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
  useParams: () => ({}),
}));

beforeEach(() => {
  mockRefresh.mockClear();
});

describe("ErrorDisplay", () => {
  it("renders with default props", () => {
    render(<ErrorDisplay />);

    expect(screen.getByText("Terjadi Kesalahan")).toBeInTheDocument();
    expect(
      screen.getByText("Maaf, terjadi kesalahan saat memuat data. Silakan coba lagi.")
    ).toBeInTheDocument();
    expect(screen.getByText("Coba Lagi")).toBeInTheDocument();
  });

  it("renders with custom title and message", () => {
    render(<ErrorDisplay title="Custom Error" message="Custom message here" />);

    expect(screen.getByText("Custom Error")).toBeInTheDocument();
    expect(screen.getByText("Custom message here")).toBeInTheDocument();
  });

  it("hides retry button when showRetry is false", () => {
    render(<ErrorDisplay showRetry={false} />);

    expect(screen.queryByText("Coba Lagi")).not.toBeInTheDocument();
  });

  it("calls router.refresh() when retry button is clicked", () => {
    render(<ErrorDisplay />);

    fireEvent.click(screen.getByText("Coba Lagi"));
    expect(mockRefresh).toHaveBeenCalledTimes(1);
  });
});
