import Link from "next/link";
import { Bookmark, Check, CheckCircle2 } from "lucide-react";
import { PlatformIcon } from "@/components/resources/platform-icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toggleBookmarkFromForm, toggleSolvedFromForm } from "@/actions/progress.actions";
import type { DbQuestionWithPlacement } from "@/lib/db/queries";

const difficultyTone: Record<string, string> = {
  basic: "border-stone-300 bg-stone-50 text-stone-700 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200",
  easy: "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
  medium: "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200",
  hard: "border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200",
  unknown: "border-border bg-muted text-muted-foreground",
};

const difficultyDot: Record<string, string> = {
  basic: "bg-stone-400",
  easy: "bg-emerald-500",
  medium: "bg-amber-500",
  hard: "bg-rose-500",
  unknown: "bg-muted-foreground",
};

function formatDifficulty(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function QuestionTable({
  questions,
  sheetSlug,
  pagination,
}: {
  questions: DbQuestionWithPlacement[];
  sheetSlug: string;
  pagination?: { page: number; totalPages: number; total: number; previousHref?: string; nextHref?: string };
}) {
  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      {pagination ? (
        <div className="flex flex-col gap-3 border-b bg-muted/20 p-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>Showing {questions.length} of {pagination.total} questions · Page {pagination.page} of {pagination.totalPages}</span>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm" className="rounded-full" disabled={!pagination.previousHref}>
              {pagination.previousHref ? <Link href={pagination.previousHref}>Previous</Link> : <span>Previous</span>}
            </Button>
            <Button asChild variant="outline" size="sm" className="rounded-full" disabled={!pagination.nextHref}>
              {pagination.nextHref ? <Link href={pagination.nextHref}>Next</Link> : <span>Next</span>}
            </Button>
          </div>
        </div>
      ) : null}
      <div className="max-h-[72vh] overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-card shadow-sm">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-14">#</TableHead>
              <TableHead>Question</TableHead>
              <TableHead className="hidden xl:table-cell">Section</TableHead>
              <TableHead className="w-32">Level</TableHead>
              <TableHead className="hidden w-48 md:table-cell">Practice</TableHead>
              <TableHead className="w-32 text-right">Progress</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {questions.map((question) => (
              <TableRow key={question.id} className="group align-middle hover:bg-muted/30">
                <TableCell className="font-mono text-xs text-muted-foreground">{String(question.order).padStart(2, "0")}</TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1.5 py-1">
                    <Link href={`/questions/${question.id}`} className="max-w-2xl font-medium leading-5 hover:underline">
                      {question.title}
                    </Link>
                    <p className="text-xs text-muted-foreground xl:hidden">{question.sectionTitle}</p>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {question.topics.slice(0, 2).map((topic) => (
                      <Badge key={topic} variant="secondary" className="rounded-full text-[10px]">{topic}</Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="hidden max-w-64 truncate text-sm text-muted-foreground xl:table-cell">
                  {question.sectionTitle}
                </TableCell>
                <TableCell>
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${difficultyTone[question.difficulty]}`}>
                    <span className={`size-1.5 rounded-full ${difficultyDot[question.difficulty]}`} />
                    {formatDifficulty(question.difficulty)}
                  </span>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="flex items-center gap-1.5">
                    {question.links.slice(0, 4).map((link) => (
                      <Button key={link.url} asChild variant="ghost" size="icon" className="size-8 rounded-full border bg-background hover:bg-muted">
                        <a href={link.url} target="_blank" rel="noreferrer" title={link.label} aria-label={link.label}>
                          <PlatformIcon platform={`${link.platform || ""} ${link.label} ${link.url}`} className="size-7" />
                        </a>
                      </Button>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="mb-1 flex justify-end">
                    {question.solved ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200">
                        <CheckCircle2 className="size-3.5" /> Done
                      </span>
                    ) : question.bookmarked ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-200">
                        <Bookmark className="size-3.5" /> Saved
                      </span>
                    ) : (
                      <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">Open</span>
                    )}
                  </div>
                  <div className="flex justify-end gap-1 opacity-70 transition group-hover:opacity-100">
                    <form action={toggleSolvedFromForm}>
                      <input type="hidden" name="questionSourceId" value={question.id} />
                      <input type="hidden" name="sheetSlug" value={sheetSlug} />
                      <Button size="icon-sm" variant="ghost" className="rounded-full" title={question.solved ? "Mark unsolved" : "Mark solved"}>
                        <Check className="size-3.5" />
                        <span className="sr-only">{question.solved ? "Mark unsolved" : "Mark solved"}</span>
                      </Button>
                    </form>
                    <form action={toggleBookmarkFromForm}>
                      <input type="hidden" name="questionSourceId" value={question.id} />
                      <input type="hidden" name="sheetSlug" value={sheetSlug} />
                      <Button size="icon-sm" variant="ghost" className="rounded-full" title={question.bookmarked ? "Remove bookmark" : "Bookmark"}>
                        <Bookmark className="size-3.5" />
                        <span className="sr-only">{question.bookmarked ? "Remove bookmark" : "Bookmark"}</span>
                      </Button>
                    </form>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
