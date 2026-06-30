import { NavSkeleton, Skeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <main className="min-h-screen">
      <NavSkeleton />
      <div className="mx-auto max-w-3xl px-6 pt-10">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="mt-4 h-44 w-full rounded-lg" />
        <Skeleton className="mt-8 h-3 w-40" />
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Skeleton className="h-20 w-full rounded-lg" />
          <Skeleton className="h-20 w-full rounded-lg" />
        </div>
      </div>
    </main>
  );
}
