import { GridSkeleton } from "@/components/ui/Skeleton";

export default function KomikLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search bar skeleton */}
      <div className="mb-8">
        <div className="h-12 w-full max-w-md mx-auto rounded-lg bg-muted animate-pulse" />
      </div>

      {/* Section skeleton */}
      <div className="space-y-8">
        <div>
          <div className="h-8 w-48 bg-muted rounded animate-pulse mb-4" />
          <GridSkeleton count={6} />
        </div>

        <div>
          <div className="h-8 w-48 bg-muted rounded animate-pulse mb-4" />
          <GridSkeleton count={6} />
        </div>
      </div>
    </div>
  );
}
