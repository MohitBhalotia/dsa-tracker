import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-48 rounded-xl" />
      <Skeleton className="h-16 rounded-xl" />
      <Skeleton className="h-[540px] rounded-xl" />
    </div>
  );
}
