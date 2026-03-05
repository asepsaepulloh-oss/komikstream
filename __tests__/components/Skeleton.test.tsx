/**
 * Tests for src/components/ui/Skeleton.tsx
 */

import { render } from "@testing-library/react";
import { Skeleton, CardSkeleton, GridSkeleton, SectionSkeleton } from "@/components/ui/Skeleton";

describe("Skeleton", () => {
  it("renders a div element", () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild).toBeInTheDocument();
    expect(container.firstChild?.nodeName).toBe("DIV");
  });

  it("applies custom className", () => {
    const { container } = render(<Skeleton className="h-8 w-32" />);
    expect(container.firstChild).toHaveClass("h-8");
    expect(container.firstChild).toHaveClass("w-32");
  });

  it("has base shimmer classes", () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild).toHaveClass("bg-muted");
  });
});

describe("CardSkeleton", () => {
  it("renders 3 skeleton elements (image, title, subtitle)", () => {
    const { container } = render(<CardSkeleton />);
    // The card skeleton should have a wrapper div with 3 Skeleton children
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.children).toHaveLength(3);
  });
});

describe("GridSkeleton", () => {
  it("renders 12 cards by default", () => {
    const { container } = render(<GridSkeleton />);
    const grid = container.firstChild as HTMLElement;
    expect(grid.children).toHaveLength(12);
  });

  it("renders custom count of cards", () => {
    const { container } = render(<GridSkeleton count={6} />);
    const grid = container.firstChild as HTMLElement;
    expect(grid.children).toHaveLength(6);
  });

  it("has grid CSS classes", () => {
    const { container } = render(<GridSkeleton />);
    expect(container.firstChild).toHaveClass("grid");
  });
});

describe("SectionSkeleton", () => {
  it("renders a section element", () => {
    const { container } = render(<SectionSkeleton />);
    expect(container.querySelector("section")).toBeInTheDocument();
  });

  it("contains a GridSkeleton with 12 cards inside", () => {
    const { container } = render(<SectionSkeleton />);
    // GridSkeleton renders inside the section — it's a grid div
    const gridDiv = container.querySelector(".grid");
    expect(gridDiv).toBeInTheDocument();
    expect(gridDiv!.children).toHaveLength(12);
  });
});
