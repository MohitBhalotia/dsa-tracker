import { addDays } from "date-fns";

export const REVISION_INTERVALS = [1, 3, 7, 15, 30] as const;

export function getNextRevisionDate(stage: number, from = new Date()) {
  const interval = REVISION_INTERVALS[Math.min(stage, REVISION_INTERVALS.length - 1)];
  return addDays(from, interval);
}

export function getRevisionState(nextRevisionAt?: Date | string | null) {
  if (!nextRevisionAt) return "upcoming";
  const next = new Date(nextRevisionAt);
  const now = new Date();
  const today = now.toDateString();
  if (next.toDateString() === today) return "due-today";
  if (next < now) return "overdue";
  return "upcoming";
}
