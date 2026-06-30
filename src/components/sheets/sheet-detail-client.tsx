"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { SheetWorkspace } from "@/components/sheets/sheet-workspace";
import { fetchJson, queryKeys } from "@/lib/api/client";
import type { DbQuestionWithPlacement, FilterOptionsForUser, SheetFilters } from "@/lib/db/queries";

type SheetDetailPayload = {
  basePath: string;
  title: string;
  description: string;
  options: FilterOptionsForUser;
  filters: SheetFilters;
  questions: DbQuestionWithPlacement[];
  sheetSlug: string;
  totalCount: number;
  dueCount: number;
};

export function SheetDetailClient() {
  const params = useParams<{ sheetSlug: string }>();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const slug = params.sheetSlug;
  const url = `/api/app/sheets/${slug}${search ? `?${search}` : ""}`;
  const { data, error, isPending } = useQuery({
    queryKey: queryKeys.sheetDetail(slug, search),
    queryFn: () => fetchJson<SheetDetailPayload>(url),
  });

  if (isPending) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-[540px] rounded-xl" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Sheet failed to load</AlertTitle>
        <AlertDescription>{error instanceof Error ? error.message : "Refresh and try again."}</AlertDescription>
      </Alert>
    );
  }

  return <SheetWorkspace {...data} />;
}
