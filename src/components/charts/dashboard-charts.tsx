"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Analytics = {
  bySection: { topic: string; total: number; solved: number; percent: number }[];
  byDifficulty: { difficulty: string; total: number; solved: number }[];
  solvedVsUnsolved: { name: string; value: number }[];
  weekly: { week: string; solved: number; revisions: number }[];
  heatmap: { date: string; count: number }[];
  sheetComparison: { sheet: string; solved: number; total: number }[];
};

function EmptyChart({ title }: { title: string }) {
  return (
    <div className="grid h-full place-items-center rounded-xl border border-dashed bg-muted/30 p-6 text-center">
      <div>
        <p className="font-medium">{title}</p>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">This chart starts filling after you build enough solved history.</p>
      </div>
    </div>
  );
}

function ProgressRow({ label, solved, total }: { label: string; solved: number; total: number }) {
  const percent = total ? Math.round((solved / total) * 100) : 0;
  const percentLabel = solved > 0 && percent === 0 ? "<1%" : `${percent}%`;

  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-3 text-sm">
        <span className="truncate">{label}</span>
        <span className="shrink-0 text-muted-foreground">{solved}/{total} - {percentLabel}</span>
      </div>
      <div className="h-2 rounded-full bg-muted">
        <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function SolvedRing({ solved, total }: { solved: number; total: number }) {
  const percent = total ? Math.round((solved / total) * 100) : 0;
  const visualPercent = solved > 0 ? Math.max(percent, 1) : 0;
  const percentLabel = solved > 0 && percent === 0 ? "<1%" : `${percent}%`;

  return (
    <div className="grid h-full place-items-center">
      <div
        className="grid size-52 place-items-center rounded-full"
        style={{ background: `conic-gradient(#10b981 ${visualPercent * 3.6}deg, var(--muted) 0deg)` }}
      >
        <div className="grid size-36 place-items-center rounded-full bg-card text-center">
          <div>
            <p className="text-4xl font-semibold">{solved}</p>
            <p className="text-sm text-muted-foreground">of {total} solved</p>
            <p className="mt-1 text-xs text-muted-foreground">{percentLabel} complete</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function getMonthBlocks(heatmap: { date: string; count: number }[]) {
  const byDate = new Map(heatmap.map((day) => [day.date, day.count]));
  const latest = heatmap.at(-1)?.date ? new Date(`${heatmap.at(-1)?.date}T00:00:00`) : new Date();
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(latest.getFullYear(), latest.getMonth() - (5 - index), 1);
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const leadingBlanks = new Date(year, month, 1).getDay();
    const days = [
      ...Array.from({ length: leadingBlanks }, (_, blankIndex) => ({ key: `blank-${year}-${month}-${blankIndex}`, count: null as number | null, date: "" })),
      ...Array.from({ length: daysInMonth }, (_, dayIndex) => {
        const day = dayIndex + 1;
        const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        return { key, date: key, count: byDate.get(key) ?? 0 };
      }),
    ];

    return {
      key: `${year}-${month}`,
      label: date.toLocaleString("en", { month: "short" }),
      days,
    };
  });

  return months;
}

function streakStats(days: { date: string; count: number }[]) {
  let max = 0;
  let current = 0;
  let running = 0;

  for (const day of days) {
    if (day.count > 0) {
      running += 1;
      max = Math.max(max, running);
    } else {
      running = 0;
    }
  }

  for (let index = days.length - 1; index >= 0; index -= 1) {
    if (days[index].count > 0) current += 1;
    else break;
  }

  return { max, current };
}

export function MonthActivityHeatmap({ heatmap }: { heatmap: { date: string; count: number }[] }) {
  const months = getMonthBlocks(heatmap);
  const visibleDates = new Set(months.flatMap((month) => month.days.map((day) => day.date).filter(Boolean)));
  const visibleDays = heatmap.filter((day) => visibleDates.has(day.date));
  const submissions = visibleDays.reduce((sum, day) => sum + day.count, 0);
  const streaks = streakStats(visibleDays);
  const firstMonth = months[0]?.label;
  const lastMonth = months.at(-1)?.label;
  const year = heatmap.at(-1)?.date ? new Date(`${heatmap.at(-1)?.date}T00:00:00`).getFullYear() : new Date().getFullYear();

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-5 text-xs font-semibold text-muted-foreground">
          <span>Submissions <strong className="text-foreground">{submissions}</strong></span>
          <span>Max.Streak <strong className="text-foreground">{streaks.max}</strong></span>
          <span>Current.Streak <strong className="text-foreground">{streaks.current}</strong></span>
        </div>
        <div className="rounded-lg border bg-muted/40 px-3 py-1.5 text-sm text-muted-foreground">
          {year} ({firstMonth} - {lastMonth})
        </div>
      </div>
      <div className="grid gap-x-8 gap-y-6 md:grid-cols-3 xl:grid-cols-6">
        {months.map((month) => (
          <div key={month.key} className="min-w-0">
            <div className="mx-auto grid w-max grid-flow-col grid-rows-7 gap-1">
              {month.days.map((day) => (
                <div
                  key={day.key}
                  title={day.date ? `${day.date}: ${day.count} activities` : ""}
                  className={cn(
                    "size-3 rounded-[3px] 2xl:size-3.5",
                    day.count === null && "invisible",
                    day.count === 0 && "border border-border bg-muted/70",
                    day.count === 1 && "bg-emerald-500/60",
                    day.count === 2 && "bg-emerald-500/80",
                    typeof day.count === "number" && day.count >= 3 && "bg-emerald-500",
                  )}
                />
              ))}
            </div>
            <p className="mt-3 text-center text-sm text-muted-foreground">{month.label}</p>
          </div>
        ))}
      </div>
      <div className="mt-5 flex items-center justify-end gap-2 text-xs text-muted-foreground">
        <span>Less</span>
        {["bg-muted/70 border border-border", "bg-emerald-500/60", "bg-emerald-500/80", "bg-emerald-500"].map((color) => (
          <span key={color} className={cn("size-3 rounded-[3px] 2xl:size-3.5", color)} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}

export function DashboardCharts({ analytics }: { analytics: Analytics }) {
  const totalSolved = analytics.solvedVsUnsolved.find((item) => item.name === "Solved")?.value ?? 0;
  const totalQuestions = analytics.solvedVsUnsolved.reduce((sum, item) => sum + item.value, 0);
  const strongestTopic = [...analytics.bySection].filter((item) => item.solved > 0).sort((a, b) => b.percent - a.percent)[0];
  const weakestTopic = [...analytics.bySection].filter((item) => item.total > 0).sort((a, b) => a.percent - b.percent)[0];
  const hasWeeklyActivity = analytics.weekly.some((week) => week.solved > 0 || week.revisions > 0);
  const meaningfulTopics = [...analytics.bySection]
    .filter((item) => item.solved > 0)
    .sort((a, b) => b.solved - a.solved)
    .slice(0, 8);

  return (
    <div className="grid gap-4 xl:grid-cols-6">
      <Card className="xl:col-span-4">
        <CardHeader>
          <CardTitle>Topic momentum</CardTitle>
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            {strongestTopic ? <span className="rounded-full border px-2 py-1">Top: {strongestTopic.topic} - {strongestTopic.percent}%</span> : <span className="rounded-full border px-2 py-1">No solved topic momentum yet</span>}
            {weakestTopic ? <span className="rounded-full border px-2 py-1">Needs work: {weakestTopic.topic} - {weakestTopic.percent}%</span> : null}
          </div>
        </CardHeader>
        <CardContent className="min-h-80">
          {meaningfulTopics.length ? (
            <div className="space-y-4">
              {meaningfulTopics.map((topic) => (
                <ProgressRow key={topic.topic} label={topic.topic} solved={topic.solved} total={topic.total} />
              ))}
              {meaningfulTopics.length < 4 ? (
                <div className="rounded-xl border border-dashed bg-muted/20 p-4 text-sm text-muted-foreground">
                  Only topics with solved questions appear here. More rows will unlock as you mark additional problems solved.
                </div>
              ) : null}
            </div>
          ) : (
            <EmptyChart title="No solved topics yet" />
          )}
        </CardContent>
      </Card>

      <Card className="xl:col-span-2">
        <CardHeader>
          <CardTitle>Solved split</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <SolvedRing solved={totalSolved} total={totalQuestions} />
        </CardContent>
      </Card>

      <Card className="xl:col-span-3">
        <CardHeader>
          <CardTitle>Weekly trend</CardTitle>
          <p className="text-sm text-muted-foreground">Solved questions and completed revisions over the last 8 weeks.</p>
        </CardHeader>
        <CardContent className="h-72">
          {!hasWeeklyActivity ? (
            <EmptyChart title="No weekly activity yet" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.weekly}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="week" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="solved" stroke="#10b981" strokeWidth={2} dot />
                <Line type="monotone" dataKey="revisions" stroke="#a8c8e8" strokeWidth={2} dot />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card className="xl:col-span-3">
        <CardHeader>
          <CardTitle>Sheet comparison</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {analytics.sheetComparison.map((sheet) => (
            <div key={sheet.sheet}>
              <div className="mb-1 flex justify-between text-sm">
                <span>{sheet.sheet}</span>
                <span className="text-muted-foreground">{sheet.solved}/{sheet.total}</span>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.round((sheet.solved / sheet.total) * 100)}%` }} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
