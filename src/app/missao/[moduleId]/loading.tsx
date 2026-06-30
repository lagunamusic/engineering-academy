import { Skeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-6xl px-6 pt-6">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="mt-8 h-8 w-72 max-w-full" />
        <Skeleton className="mt-4 h-6 w-96 max-w-full" />
        <Skeleton className="mt-8 h-80 w-full rounded-lg" />
      </div>
    </main>
  );
}
