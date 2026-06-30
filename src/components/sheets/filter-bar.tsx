"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Difficulty } from "@/types/seed";

type FilterOptions = {
  sections: { id: string; title: string }[];
  difficulties: Difficulty[];
  platforms: string[];
  companies: string[];
};

type ActiveFilters = {
  q?: string;
  topic?: string;
  difficulty?: Difficulty | "all";
  platform?: string;
  company?: string;
};

type FilterSummary = {
  solvedCount: number;
  shownCount: number;
  totalCount: number;
  bookmarkedCount: number;
  dueCount: number;
  solvedByDifficulty: Record<Difficulty, number>;
};

const difficultyColors: Record<Difficulty, string> = {
  basic: "#94a3b8",
  easy: "#10b981",
  medium: "#f59e0b",
  hard: "#ef4444",
  unknown: "#64748b",
};

const visibleDifficulties: Difficulty[] = ["basic", "easy", "medium", "hard"];

function getDifficultyGradient(summary: FilterSummary) {
  const solvedEntries = (Object.entries(summary.solvedByDifficulty) as [Difficulty, number][]).filter(([, count]) => count > 0);
  if (!summary.solvedCount || !summary.shownCount || solvedEntries.length === 0) {
    return "color-mix(in oklab, var(--muted), var(--foreground) 4%) 0 100%";
  }

  let cursor = 0;
  const segments = solvedEntries.map(([difficulty, count]) => {
    const start = cursor;
    cursor += (count / summary.shownCount) * 100;
    return `${difficultyColors[difficulty]} ${start}% ${cursor}%`;
  });

  segments.push(`color-mix(in oklab, var(--muted), var(--foreground) 4%) ${cursor}% 100%`);
  return segments.join(", ");
}

export function FilterBar({
  basePath = "/sheets/strivers-a2z-dsa-sheet",
  title,
  description,
  options,
  filters = {},
  summary,
  actions,
  children,
}: {
  basePath?: string;
  title?: string;
  description?: string;
  options: FilterOptions;
  filters?: ActiveFilters;
  summary: FilterSummary;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}) {
  const [query, setQuery] = useState(filters.q || "");
  const [topic, setTopic] = useState(filters.topic || "all");
  const [difficulty, setDifficulty] = useState(filters.difficulty || "all");
  const [platform, setPlatform] = useState(filters.platform || "all");
  const [company, setCompany] = useState(filters.company || "all");
  const hasSelectedFilter = topic !== "all" || difficulty !== "all" || platform !== "all" || company !== "all";
  const hasAnyFilter = query.trim().length > 0 || hasSelectedFilter;
  const [filtersOpen, setFiltersOpen] = useState(hasSelectedFilter);
  const active = [
    filters.q ? `Search: ${filters.q}` : null,
    filters.topic && filters.topic !== "all" ? `Topic: ${options.sections.find((section) => section.id === filters.topic)?.title || filters.topic}` : null,
    filters.difficulty && filters.difficulty !== "all" ? `Difficulty: ${filters.difficulty}` : null,
    filters.platform && filters.platform !== "all" ? `Platform: ${filters.platform}` : null,
    filters.company && filters.company !== "all" ? `Company: ${filters.company}` : null,
  ].filter(Boolean);
  const selectControls = useMemo(() => (
    <>
      <Select name="topic" value={topic} onValueChange={setTopic}>
        <SelectTrigger className="h-9 w-36 rounded-lg"><SelectValue placeholder="Topic" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All topics</SelectItem>
          {options.sections.map((section) => <SelectItem key={section.id} value={section.id}>{section.title}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select name="difficulty" value={difficulty} onValueChange={(value) => setDifficulty(value as Difficulty | "all")}>
        <SelectTrigger className="h-9 w-36 rounded-lg"><SelectValue placeholder="Difficulty" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All difficulty</SelectItem>
          {options.difficulties.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select name="platform" value={platform} onValueChange={setPlatform}>
        <SelectTrigger className="h-9 w-36 rounded-lg"><SelectValue placeholder="Platform" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All platforms</SelectItem>
          {options.platforms.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
        </SelectContent>
      </Select>
      {options.companies.length ? (
        <Select name="company" value={company} onValueChange={setCompany}>
          <SelectTrigger className="h-9 w-36 rounded-lg"><SelectValue placeholder="Company" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All companies</SelectItem>
            {options.companies.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
          </SelectContent>
        </Select>
      ) : null}
    </>
  ), [company, difficulty, options.companies, options.difficulties, options.platforms, options.sections, platform, topic]);

  return (
    <div className="mb-5 rounded-xl border bg-card shadow-sm">
      <div className="grid gap-4 border-b p-4 lg:grid-cols-[minmax(0,1fr)_auto_128px] lg:items-center">
        <div className="min-w-0">
          {title ? <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1> : null}
          {description ? (
            <p className="mt-3 max-w-5xl text-sm leading-6 text-muted-foreground sm:text-base">
              {description}
            </p>
          ) : null}
        </div>

        {actions ? <div className="flex items-center justify-start lg:justify-end">{actions}</div> : null}

        <div className="group relative size-28 justify-self-start outline-none lg:justify-self-end" tabIndex={0}>
          <div
            data-sheet-progress-donut
            className="absolute inset-0 rounded-full"
            style={{
              background: `conic-gradient(${getDifficultyGradient(summary)})`,
            }}
          />
          <div className="absolute inset-[14px] grid place-items-center rounded-full bg-card text-center">
            <div>
              <p className="text-2xl font-semibold leading-none">{summary.solvedCount}</p>
              <p className="text-sm font-medium text-muted-foreground">/ {summary.shownCount}</p>
            </div>
          </div>
          <div className="pointer-events-none absolute right-0 top-full z-20 mt-2 min-w-44 rounded-lg border bg-popover p-3 text-xs text-popover-foreground opacity-0 shadow-md transition group-hover:opacity-100 group-focus:opacity-100">
            <p className="mb-2 font-medium">Solved by difficulty</p>
            <div className="space-y-1.5">
              {visibleDifficulties.map((difficulty) => (
                <div key={difficulty} className="flex items-center justify-between gap-4 capitalize">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="size-2 rounded-full" style={{ backgroundColor: difficultyColors[difficulty] }} />
                    {difficulty}
                  </span>
                  <span className="font-mono text-muted-foreground">{summary.solvedByDifficulty[difficulty]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <form action={basePath} className="grid min-h-16 items-center gap-2 p-3 lg:grid-cols-[minmax(260px,1fr)_auto]">
        <label className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input name="q" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search questions, topics, companies" className="h-9 rounded-lg pl-9" />
        </label>
        <div className="flex flex-wrap items-center justify-start gap-2 lg:justify-end">
          {filtersOpen ? selectControls : null}
          <Button type="button" variant="outline" className="h-9 rounded-lg" onClick={() => setFiltersOpen((open) => !open)}>
            <SlidersHorizontal className="size-4" />
            Filters
          </Button>
          <button disabled={!hasAnyFilter} className="h-9 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50">Apply</button>
        </div>
      </form>
      {active.length ? (
        <div className="flex flex-wrap items-center gap-2 px-3 pb-3">
          {active.map((label) => <Badge key={label} variant="secondary" className="rounded-full">{label}</Badge>)}
          <Button asChild variant="ghost" size="sm" className="h-7 rounded-full text-xs">
            <Link href={basePath}><X className="size-3" /> Clear all</Link>
          </Button>
        </div>
      ) : null}
      <div className="mt-5">
        {children}
      </div>
    </div>
  );
}
