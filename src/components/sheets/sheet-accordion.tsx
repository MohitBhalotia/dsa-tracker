"use client";

import { useMemo, useState, type Dispatch, type SetStateAction, type TransitionStartFunction } from "react";
import { Bookmark, CheckCircle2, ChevronDown, ChevronRight, NotebookPen } from "lucide-react";
import { toggleBookmark, toggleSolved, updateQuestionNotes } from "@/actions/progress.actions";
import { PlatformIcon } from "@/components/resources/platform-icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { DbQuestionWithPlacement } from "@/lib/db/queries";

type LectureGroup = {
  id: string;
  title: string;
  questions: DbQuestionWithPlacement[];
};

type SectionGroup = {
  id: string;
  title: string;
  lectures: LectureGroup[];
  questions: DbQuestionWithPlacement[];
};

const difficultyTone: Record<string, string> = {
  basic: "border-stone-300 bg-stone-50 text-stone-700 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200",
  easy: "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
  medium: "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200",
  hard: "border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200",
  unknown: "border-border bg-muted text-muted-foreground",
};

function formatDifficulty(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function progressPercent(questions: DbQuestionWithPlacement[], isSolved: (question: DbQuestionWithPlacement) => boolean) {
  if (!questions.length) return 0;
  return Math.round((questions.filter((question) => isSolved(question)).length / questions.length) * 100);
}

function solvedLabel(questions: DbQuestionWithPlacement[], isSolved: (question: DbQuestionWithPlacement) => boolean) {
  return `${questions.filter((question) => isSolved(question)).length} / ${questions.length}`;
}

function getBestExternalHref(question: DbQuestionWithPlacement) {
  const priority = ["leetcode", "gfg", "geeksforgeeks", "takeuforward", "tuf", "youtube", "youtu.be"];
  const link = [...question.links]
    .sort((a, b) => {
      const aText = `${a.platform} ${a.label} ${a.url}`.toLowerCase();
      const bText = `${b.platform} ${b.label} ${b.url}`.toLowerCase();
      const aRank = priority.findIndex((needle) => aText.includes(needle));
      const bRank = priority.findIndex((needle) => bText.includes(needle));
      return (aRank === -1 ? 999 : aRank) - (bRank === -1 ? 999 : bRank);
    })
    .at(0);

  return link?.url || `/questions/${question.id}`;
}

function groupQuestions(questions: DbQuestionWithPlacement[]) {
  const sections = new Map<string, SectionGroup>();

  for (const question of questions) {
    let section = sections.get(question.sectionId);
    if (!section) {
      section = { id: question.sectionId, title: question.sectionTitle, lectures: [], questions: [] };
      sections.set(question.sectionId, section);
    }
    section.questions.push(question);

    let lecture = section.lectures.find((item) => item.id === question.subTopicId);
    if (!lecture) {
      lecture = { id: question.subTopicId, title: question.subTopicTitle, questions: [] };
      section.lectures.push(lecture);
    }
    lecture.questions.push(question);
  }

  return Array.from(sections.values());
}

function ProgressLine({ percent, className }: { percent: number; className?: string }) {
  return (
    <div className={cn("h-1 rounded-full bg-muted", className)}>
      <div className="h-full rounded-full bg-orange-400" style={{ width: `${percent}%` }} />
    </div>
  );
}

function celebrateProgress() {
  const donut = document.querySelector("[data-sheet-progress-donut]");
  if (!donut) return;

  donut.classList.remove("progress-celebrate");
  void (donut as HTMLElement).offsetWidth;
  donut.classList.add("progress-celebrate");

  const rect = donut.getBoundingClientRect();
  const colors = ["#10b981", "#f59e0b", "#ef4444", "#38bdf8", "#a78bfa"];

  for (let index = 0; index < 18; index += 1) {
    const particle = document.createElement("span");
    const angle = (Math.PI * 2 * index) / 18;
    const distance = 42 + Math.random() * 34;
    particle.className = "progress-confetti";
    particle.style.left = `${rect.left + rect.width / 2}px`;
    particle.style.top = `${rect.top + rect.height / 2}px`;
    particle.style.backgroundColor = colors[index % colors.length];
    particle.style.setProperty("--x", `${Math.cos(angle) * distance}px`);
    particle.style.setProperty("--y", `${Math.sin(angle) * distance}px`);
    document.body.appendChild(particle);
    window.setTimeout(() => particle.remove(), 850);
  }
}

export function SheetAccordion({
  questions,
  sheetSlug,
  isPending,
  startTransition,
  optimisticSolved,
  setOptimisticSolved,
  optimisticBookmarked,
  setOptimisticBookmarked,
  noteOverrides,
  setNoteOverrides,
}: {
  questions: DbQuestionWithPlacement[];
  sheetSlug: string;
  isPending: boolean;
  startTransition: TransitionStartFunction;
  optimisticSolved: Record<string, boolean>;
  setOptimisticSolved: (next: { id: string; value: boolean }) => void;
  optimisticBookmarked: Record<string, boolean>;
  setOptimisticBookmarked: (next: { id: string; value: boolean }) => void;
  noteOverrides: Record<string, string>;
  setNoteOverrides: Dispatch<SetStateAction<Record<string, string>>>;
}) {
  const sections = useMemo(() => groupQuestions(questions), [questions]);
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());
  const [openLectures, setOpenLectures] = useState<Set<string>>(new Set());
  const [notesQuestion, setNotesQuestion] = useState<DbQuestionWithPlacement | null>(null);

  const isSolved = (question: DbQuestionWithPlacement) => optimisticSolved[question.id] ?? question.solved;
  const isBookmarked = (question: DbQuestionWithPlacement) => optimisticBookmarked[question.id] ?? question.bookmarked;
  const notesFor = (question: DbQuestionWithPlacement) => noteOverrides[question.id] ?? question.notes;
  const hasNotes = (question: DbQuestionWithPlacement) => notesFor(question).trim().length > 0;

  const toggleSection = (id: string) => {
    setOpenSections((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleLecture = (id: string) => {
    setOpenLectures((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (!sections.length) {
    return (
      <div className="rounded-xl border border-dashed bg-card p-8 text-center">
        <p className="font-medium">No questions match these filters.</p>
        <p className="mt-2 text-sm text-muted-foreground">Clear filters or search for another topic.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3 border-t px-4 py-4">
        {sections.map((section, sectionIndex) => {
          const sectionOpen = openSections.has(section.id);
          const sectionPercent = progressPercent(section.questions, isSolved);

          return (
            <div key={section.id} className="overflow-hidden rounded-lg border bg-card shadow-sm">
              <button
                type="button"
                onClick={() => toggleSection(section.id)}
                className="w-full px-4 py-4 text-left transition hover:bg-muted/30"
              >
                <div className="flex items-center gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="truncate text-base font-semibold">Step {sectionIndex + 1}: {section.title}</h2>
                      <span className="font-mono text-sm font-semibold text-muted-foreground">{solvedLabel(section.questions, isSolved)}</span>
                    </div>
                  </div>
                  {sectionOpen ? <ChevronDown className="size-4 text-muted-foreground" /> : <ChevronRight className="size-4 text-muted-foreground" />}
                </div>
                <ProgressLine percent={sectionPercent} className="mt-4" />
              </button>

              {sectionOpen ? (
                <div className="space-y-2 border-t p-3">
                  {section.lectures.map((lecture, lectureIndex) => {
                    const lectureKey = `${section.id}:${lecture.id}`;
                    const lectureOpen = openLectures.has(lectureKey);
                    const lecturePercent = progressPercent(lecture.questions, isSolved);

                    return (
                      <div key={lectureKey} className="overflow-hidden rounded-md border bg-background">
                        <button
                          type="button"
                          onClick={() => toggleLecture(lectureKey)}
                          className="w-full px-4 py-3 text-left transition hover:bg-muted/30"
                        >
                          <ProgressLine percent={lecturePercent} className="-mx-4 -mt-3 mb-3 rounded-none" />
                          <div className="flex items-center gap-4">
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-3">
                                <h3 className="truncate text-sm font-semibold">Lec {lectureIndex + 1}: {lecture.title}</h3>
                                <span className="font-mono text-sm font-semibold text-muted-foreground">{solvedLabel(lecture.questions, isSolved)}</span>
                              </div>
                            </div>
                            {lectureOpen ? <ChevronDown className="size-4 text-muted-foreground" /> : <ChevronRight className="size-4 text-muted-foreground" />}
                          </div>
                        </button>

                        {lectureOpen ? (
                          <div className="divide-y border-t">
                            {lecture.questions.map((question) => {
                              const solved = isSolved(question);
                              const bookmarked = isBookmarked(question);
                              const noted = hasNotes(question);

                              return (
                              <div key={question.id} className="grid gap-3 px-4 py-3 md:grid-cols-[40px_minmax(0,1fr)_120px_160px_auto] md:items-center">
                                <div className="flex md:justify-start">
                                  <Button
                                    type="button"
                                    size="icon"
                                    variant="ghost"
                                    className={cn(
                                      "size-8 rounded-full p-0 text-emerald-500 hover:bg-emerald-500/10",
                                      isPending && "opacity-80",
                                    )}
                                    title={solved ? "Mark unsolved" : "Mark solved"}
                                    onClick={() => {
                                      const next = !solved;
                                      if (next) celebrateProgress();
                                      startTransition(async () => {
                                        setOptimisticSolved({ id: question.id, value: next });
                                        await toggleSolved({ sheetSlug, questionSourceId: question.id });
                                      });
                                    }}
                                  >
                                    {solved ? <CheckCircle2 className="size-5" /> : <span className="size-5 rounded-full border-2 border-current" />}
                                    <span className="sr-only">{solved ? "Mark unsolved" : "Mark solved"}</span>
                                  </Button>
                                </div>

                                <div className="min-w-0">
                                  <a
                                    href={getBestExternalHref(question)}
                                    target={question.links.length ? "_blank" : undefined}
                                    rel={question.links.length ? "noreferrer" : undefined}
                                    className="block truncate font-medium leading-5 hover:underline"
                                  >
                                    {question.title}
                                  </a>
                                </div>

                                <div className="flex md:justify-start">
                                  <Badge variant="outline" className={cn("rounded-full px-3 py-1 text-xs", difficultyTone[question.difficulty])}>
                                    {formatDifficulty(question.difficulty)}
                                  </Badge>
                                </div>

                                <div className="flex flex-wrap items-center gap-1.5 md:justify-start">
                                  {question.links.slice(0, 4).map((link) => (
                                    <a key={link.url} href={link.url} target="_blank" rel="noreferrer" title={link.label} aria-label={link.label} className="grid size-8 place-items-center rounded-full border bg-background hover:bg-muted">
                                      <PlatformIcon platform={`${link.platform || ""} ${link.label} ${link.url}`} className="size-7" />
                                    </a>
                                  ))}
                                </div>

                                <div className="flex flex-wrap items-center gap-1 md:justify-end">
                                  <div>
                                    <Button
                                      type="button"
                                      size="icon"
                                      variant={bookmarked ? "secondary" : "ghost"}
                                      className={cn("size-8 rounded-full", bookmarked && "text-amber-500 dark:text-amber-300", isPending && "opacity-80")}
                                      title={bookmarked ? "Remove bookmark" : "Bookmark"}
                                      onClick={() => {
                                        const next = !bookmarked;
                                        startTransition(async () => {
                                          setOptimisticBookmarked({ id: question.id, value: next });
                                          await toggleBookmark({ sheetSlug, questionSourceId: question.id });
                                        });
                                      }}
                                    >
                                      <Bookmark className={cn("size-4.5", bookmarked && "fill-current")} />
                                      <span className="sr-only">{bookmarked ? "Remove bookmark" : "Bookmark"}</span>
                                    </Button>
                                  </div>
                                  <Button
                                    type="button"
                                    size="icon"
                                    variant={noted ? "secondary" : "ghost"}
                                    className={cn("size-8 rounded-full", noted && "text-sky-600 dark:text-sky-300")}
                                    title={noted ? "Edit notes" : "Add notes"}
                                    onClick={() => setNotesQuestion(question)}
                                  >
                                    <NotebookPen className={cn("size-4.5", noted && "fill-current")} />
                                    <span className="sr-only">{noted ? "Edit notes" : "Add notes"}</span>
                                  </Button>
                                </div>
                              </div>
                              );
                            })}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <Sheet open={Boolean(notesQuestion)} onOpenChange={(open) => !open && setNotesQuestion(null)}>
        <SheetContent className="sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>{notesQuestion?.title || "Notes"}</SheetTitle>
            <SheetDescription>Edit your private notes for this question.</SheetDescription>
          </SheetHeader>
          {notesQuestion ? (
            <form
              key={notesQuestion.id}
              action={async (formData) => {
                const notes = String(formData.get("notes") || "");
                setNoteOverrides((current) => ({ ...current, [notesQuestion.id]: notes }));
                await updateQuestionNotes(formData);
                setNotesQuestion(null);
              }}
              className="flex min-h-0 flex-1 flex-col gap-4 px-4 pb-4"
            >
              <input type="hidden" name="questionSourceId" value={notesQuestion.id} />
              <input type="hidden" name="sheetSlug" value={sheetSlug} />
              <Textarea name="notes" defaultValue={notesFor(notesQuestion)} className="min-h-[360px] flex-1 resize-none font-mono text-sm" />
              <Button className="w-full rounded-full">Save notes</Button>
            </form>
          ) : null}
        </SheetContent>
      </Sheet>
    </>
  );
}
