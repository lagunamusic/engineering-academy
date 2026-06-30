import { NavSkeleton, Skeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <main className="min-h-screen">
      <NavSkeleton />
      <div className="mx-auto max-w-3xl px-6 pt-8">
        <Skeleton className="h-7 w-36" />
        <Skeleton className="mt-3 h-4 w-72 max-w-full" />
        <Skeleton className="mt-8 h-64 w-full rounded-lg" />
      </div>
    </main>
  );
}
