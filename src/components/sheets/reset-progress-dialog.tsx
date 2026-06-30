"use client";

import { useState, useTransition } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { resetSheetProgress } from "@/actions/progress.actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { queryKeys } from "@/lib/api/client";

export function ResetProgressDialog({ sheetSlug }: { sheetSlug: string }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function resetProgress() {
    startTransition(async () => {
      try {
        await resetSheetProgress({ sheetSlug });
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: queryKeys.dashboard }),
          queryClient.invalidateQueries({ queryKey: queryKeys.sheets }),
          queryClient.invalidateQueries({ queryKey: ["sheet-detail"] }),
          queryClient.invalidateQueries({ queryKey: queryKeys.revisions }),
        ]);
        toast.success("Sheet progress reset");
        setOpen(false);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not reset progress");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" className="h-9 rounded-lg text-destructive hover:text-destructive">
          <RotateCcw className="size-4" />
          Reset progress
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset sheet progress?</DialogTitle>
          <DialogDescription>
            This clears solved status, notes, bookmarks, revision history, and activity for this sheet. This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={isPending}>Cancel</Button>
          </DialogClose>
          <Button type="button" variant="destructive" disabled={isPending} onClick={resetProgress}>
            {isPending ? "Resetting..." : "Reset progress"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
