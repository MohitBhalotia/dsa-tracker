import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-28 rounded-xl" />
      <Skeleton className="h-56 rounded-xl" />
      <Skeleton className="h-36 rounded-xl" />
    </div>
  );
}
