import { Skeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-2xl px-6 pt-6">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="mt-6 h-32 w-full rounded-lg" />
        <div className="mt-6 space-y-3">
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>
      </div>
    </main>
  );
}
