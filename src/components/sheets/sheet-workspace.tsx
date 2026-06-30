"use client";

import { useMemo, useOptimistic, useState, useTransition } from "react";
import { FilterBar } from "@/components/sheets/filter-bar";
import { ResetProgressDialog } from "@/components/sheets/reset-progress-dialog";
import { SheetAccordion } from "@/components/sheets/sheet-accordion";
import type { DbQuestionWithPlacement, SheetFilters } from "@/lib/db/queries";
import type { Difficulty } from "@/types/seed";

type FilterOptions = {
  sections: { id: string; title: string }[];
  difficulties: Difficulty[];
  platforms: string[];
  companies: string[];
};

export function SheetWorkspace({
  basePath,
  title,
  description,
  options,
  filters,
  questions,
  sheetSlug,
  totalCount,
  dueCount,
}: {
  basePath: string;
  title: string;
  description: string;
  options: FilterOptions;
  filters: SheetFilters;
  questions: DbQuestionWithPlacement[];
  sheetSlug: string;
  totalCount: number;
  dueCount: number;
}) {
  const [isPending, startTransition] = useTransition();
  const solvedBase = useMemo(() => Object.fromEntries(questions.map((question) => [question.id, question.solved])), [questions]);
  const bookmarkedBase = useMemo(() => Object.fromEntries(questions.map((question) => [question.id, question.bookmarked])), [questions]);
  const [optimisticSolved, setOptimisticSolved] = useOptimistic(
    solvedBase,
    (state, next: { id: string; value: boolean }) => ({ ...state, [next.id]: next.value }),
  );
  const [optimisticBookmarked, setOptimisticBookmarked] = useOptimistic(
    bookmarkedBase,
    (state, next: { id: string; value: boolean }) => ({ ...state, [next.id]: next.value }),
  );
  const [noteOverrides, setNoteOverrides] = useState<Record<string, string>>({});

  const solvedCount = questions.filter((question) => optimisticSolved[question.id] ?? question.solved).length;
  const bookmarkedCount = questions.filter((question) => optimisticBookmarked[question.id] ?? question.bookmarked).length;
  const solvedByDifficulty = {
    basic: questions.filter((question) => (optimisticSolved[question.id] ?? question.solved) && question.difficulty === "basic").length,
    easy: questions.filter((question) => (optimisticSolved[question.id] ?? question.solved) && question.difficulty === "easy").length,
    medium: questions.filter((question) => (optimisticSolved[question.id] ?? question.solved) && question.difficulty === "medium").length,
    hard: questions.filter((question) => (optimisticSolved[question.id] ?? question.solved) && question.difficulty === "hard").length,
    unknown: questions.filter((question) => (optimisticSolved[question.id] ?? question.solved) && question.difficulty === "unknown").length,
  };

  return (
    <FilterBar
      basePath={basePath}
      title={title}
      description={description}
      options={options}
      filters={{ ...filters, q: filters.query }}
      summary={{
        solvedCount,
        shownCount: questions.length,
        totalCount,
        bookmarkedCount,
        dueCount,
        solvedByDifficulty,
      }}
      actions={<ResetProgressDialog sheetSlug={sheetSlug} />}
    >
      <SheetAccordion
        questions={questions}
        sheetSlug={sheetSlug}
        isPending={isPending}
        startTransition={startTransition}
        optimisticSolved={optimisticSolved}
        setOptimisticSolved={setOptimisticSolved}
        optimisticBookmarked={optimisticBookmarked}
        setOptimisticBookmarked={setOptimisticBookmarked}
        noteOverrides={noteOverrides}
        setNoteOverrides={setNoteOverrides}
      />
    </FilterBar>
  );
}
