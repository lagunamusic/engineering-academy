import { NavSkeleton, Skeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <main className="min-h-screen">
      <NavSkeleton />
      <div className="mx-auto max-w-3xl px-6 pt-8">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="mt-3 h-4 w-80 max-w-full" />
        <div className="mt-8 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </main>
  );
}
