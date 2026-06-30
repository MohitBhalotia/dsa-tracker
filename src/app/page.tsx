import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Database,
  GitBranch,
  LineChart,
  LockKeyhole,
  NotebookPen,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  TimerReset,
} from "lucide-react";
import { BrandIcon } from "@/components/brand/brand-icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const navItems = [
  { href: "#product", label: "Product" },
  { href: "#analytics", label: "Analytics" },
  { href: "#revisions", label: "Revisions" },
  { href: "#sheets", label: "Sheets" },
  { href: "#security", label: "Security" },
];

const pillars = [
  {
    icon: BookOpenCheck,
    metric: "4 sheet types",
    title: "Multi-sheet tracking",
    body: "Start with Striver A2Z and keep the architecture ready for Blind 75, NeetCode 150, company sheets, and admin imports.",
  },
  {
    icon: LockKeyhole,
    metric: "User-scoped",
    title: "Private progress state",
    body: "Solved state, bookmarks, notes, attempts, confidence, and revision dates belong to the signed-in user only.",
  },
  {
    icon: TimerReset,
    metric: "1-3-7-15-30",
    title: "Spaced revision planning",
    body: "Every solved question can move into a deliberate revision queue instead of disappearing into a spreadsheet row.",
  },
  {
    icon: BarChart3,
    metric: "6 signals",
    title: "Analytics that guide practice",
    body: "Topic progress, difficulty split, weekly trend, activity heatmap, and sheet comparison give your prep a control panel.",
  },
];

const analyticsRows = [
  { label: "Arrays", solved: 29, total: 41 },
  { label: "Binary Search", solved: 18, total: 31 },
  { label: "Graphs", solved: 22, total: 54 },
  { label: "Dynamic Programming", solved: 17, total: 56 },
];

const revisionSteps = [
  { label: "Solve", value: "Day 0" },
  { label: "First review", value: "1 day" },
  { label: "Second review", value: "3 days" },
  { label: "Deep recall", value: "7 days" },
  { label: "Long-term", value: "15-30 days" },
];

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto mb-10 max-w-3xl text-center">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{eyebrow}</p>
      <h2 className="editorial-heading text-4xl leading-tight sm:text-5xl">{title}</h2>
      <p className="mt-4 text-base text-muted-foreground sm:text-lg">{description}</p>
    </div>
  );
}

function MiniHeatmap() {
  return (
    <div className="grid grid-flow-col grid-rows-7 gap-1">
      {Array.from({ length: 63 }, (_, index) => {
        const level = index % 11 === 0 ? 0 : index % 5 === 0 ? 3 : index % 3 === 0 ? 2 : 1;
        return (
          <div
            key={index}
            className={[
              "size-3 rounded-[3px] border border-border",
              level === 0 ? "bg-muted" : "",
              level === 1 ? "bg-emerald-100 dark:bg-emerald-950" : "",
              level === 2 ? "bg-emerald-300 dark:bg-emerald-800" : "",
              level === 3 ? "bg-emerald-600" : "",
            ].join(" ")}
          />
        );
      })}
    </div>
  );
}

function ProductMockup() {
  return (
    <Card className="relative overflow-hidden border-stone-300/70 bg-white/90 shadow-[0_24px_80px_rgba(41,37,36,0.12)] dark:bg-card">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(41,37,36,0.06),transparent_42%,rgba(41,37,36,0.04))]" />
      <CardContent className="relative p-4 sm:p-6">
        <div className="mb-5 flex items-center justify-between rounded-xl border bg-background/80 px-4 py-3">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Today</p>
            <p className="font-medium">Interview readiness</p>
          </div>
          <Badge className="rounded-full">Private</Badge>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border bg-card p-4">
            <p className="text-sm text-muted-foreground">Solved</p>
            <p className="mt-2 text-3xl font-semibold">128</p>
            <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-300">+9 this week</p>
          </div>
          <div className="rounded-xl border bg-card p-4">
            <p className="text-sm text-muted-foreground">Streak</p>
            <p className="mt-2 text-3xl font-semibold">14d</p>
            <p className="mt-1 text-xs text-muted-foreground">Longest 28d</p>
          </div>
          <div className="rounded-xl border bg-card p-4">
            <p className="text-sm text-muted-foreground">Due</p>
            <p className="mt-2 text-3xl font-semibold">7</p>
            <p className="mt-1 text-xs text-muted-foreground">Revisions</p>
          </div>
        </div>

        <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_180px]">
          <div className="rounded-xl border bg-card p-4">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-medium">Topic momentum</p>
              <LineChart className="size-4 text-muted-foreground" />
            </div>
            <div className="space-y-3">
              {analyticsRows.map((row) => (
                <div key={row.label}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span>{row.label}</span>
                    <span className="text-muted-foreground">{row.solved}/{row.total}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.round((row.solved / row.total) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border bg-card p-4">
            <p className="mb-3 font-medium">Activity</p>
            <MiniHeatmap />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ProblemArtifact() {
  return (
    <div className="grid gap-3">
      <div className="rounded-xl border bg-muted/50 p-4 text-sm text-muted-foreground">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-medium text-foreground">Spreadsheet row</span>
          <Badge variant="secondary" className="rounded-full">stale</Badge>
        </div>
        <div className="grid grid-cols-[1.2fr_0.8fr_0.8fr] gap-2">
          {["Binary Search", "Done?", "Notes"].map((cell) => (
            <div key={cell} className="rounded-lg border bg-background px-3 py-2 text-xs">{cell}</div>
          ))}
          {["Aggressive Cows", "maybe", ""].map((cell, index) => (
            <div key={`${cell}-${index}`} className="rounded-lg border border-dashed bg-background/60 px-3 py-2 text-xs">{cell || "empty"}</div>
          ))}
        </div>
      </div>
      <div className="rounded-xl border bg-primary p-4 text-primary-foreground shadow-xl shadow-stone-300/30 dark:shadow-black/30">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-medium">Smart next action</span>
          <Badge className="rounded-full bg-primary-foreground text-primary">ready</Badge>
        </div>
        <div className="rounded-lg border border-primary-foreground/15 bg-primary-foreground/10 p-3">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium">Revise Binary Search on Answers</p>
              <p className="mt-1 text-xs text-primary-foreground/70">Due today · confidence 2/5 · 3 attempts</p>
            </div>
            <CheckCircle2 className="size-5 text-[#A7E5D3]" />
          </div>
        </div>
      </div>
    </div>
  );
}

function SheetProgression() {
  const sheets = [
    { title: "Striver A2Z", status: "Active source", detail: "456 seeded questions", active: true },
    { title: "Blind 75", status: "Import ready", detail: "Focused interview set" },
    { title: "NeetCode 150", status: "Import ready", detail: "Pattern-based prep" },
    { title: "Company sheets", status: "Future", detail: "Targeted lists" },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {sheets.map((sheet, index) => (
        <div key={sheet.title} className="relative">
          <div className={["flex h-full min-h-36 flex-col rounded-xl border p-4", sheet.active ? "bg-primary text-primary-foreground shadow-xl shadow-stone-300/30" : "bg-card opacity-75"].join(" ")}>
            <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
              <span className={["grid size-8 shrink-0 place-items-center rounded-full text-sm", sheet.active ? "bg-primary-foreground text-primary" : "bg-muted text-muted-foreground"].join(" ")}>
                {index + 1}
              </span>
              <Badge variant={sheet.active ? "secondary" : "outline"} className="max-w-full rounded-full px-2.5 py-1 text-[11px] leading-tight">
                {sheet.status}
              </Badge>
            </div>
            <h3 className="text-base font-semibold leading-tight">{sheet.title}</h3>
            <p className={["mt-auto pt-4 text-sm leading-5", sheet.active ? "text-primary-foreground/70" : "text-muted-foreground"].join(" ")}>{sheet.detail}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function SecurityDiagram() {
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Data boundary</p>
          <p className="text-xs text-muted-foreground">Global content stays separate from personal state.</p>
        </div>
        <ShieldCheck className="size-5 text-muted-foreground" />
      </div>
      <div className="grid gap-3">
        {[
          ["Global questions", "title · links · topics"],
          ["Sheet placement", "order · section · sub-topic"],
          ["Your progress", "notes · solved · revisions"],
        ].map(([label, detail], index) => (
          <div key={label} className="flex items-center gap-3 rounded-xl border bg-muted/40 p-3">
            <span className="grid size-7 place-items-center rounded-full bg-background text-xs font-semibold">{index + 1}</span>
            <div>
              <p className="text-sm font-medium">{label}</p>
              <p className="text-xs text-muted-foreground">{detail}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <BrandIcon priority />
            DSA Tracker
          </Link>
          <div className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} className="transition hover:text-foreground">
                {item.label}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" className="hidden sm:inline-flex">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild className="rounded-full">
              <Link href="/signup">Start tracking</Link>
            </Button>
          </div>
        </div>
      </nav>

      <section className="surface-grid border-b">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(560px,640px)_minmax(0,1fr)] lg:px-8 lg:py-24">
          <div className="flex max-w-[640px] flex-col justify-center">
            <div className="mb-5 flex w-fit items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              <Sparkles className="size-3.5" />
              Premium DSA operating system
            </div>
            <h1 className="editorial-heading text-5xl leading-[1.03] sm:text-6xl">
              Prepare like your DSA progress is a product, not a spreadsheet.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              Track sheets, notes, bookmarks, revisions, confidence, and streaks in a private workspace built for serious interview prep.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full">
                <Link href="/signup">
                  Start tracking <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full">
                <a href="#product">See how it works</a>
              </Button>
            </div>
            <div className="mt-10 grid max-w-xl grid-cols-3 gap-3 text-sm">
              <div className="rounded-xl border bg-card/80 p-4">
                <p className="text-2xl font-semibold">456</p>
                <p className="text-muted-foreground">Seeded questions</p>
              </div>
              <div className="rounded-xl border bg-card/80 p-4">
                <p className="text-2xl font-semibold">18</p>
                <p className="text-muted-foreground">A2Z sections</p>
              </div>
              <div className="rounded-xl border bg-card/80 p-4">
                <p className="text-2xl font-semibold">61</p>
                <p className="text-muted-foreground">Categories</p>
              </div>
            </div>
          </div>
          <ProductMockup />
        </div>
      </section>

      <section id="product" className="border-b py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Why it exists</p>
              <h2 className="editorial-heading text-4xl leading-tight sm:text-5xl">Static sheets tell you what to solve. They do not manage preparation.</h2>
              <p className="mt-4 text-base text-muted-foreground sm:text-lg">DSA Tracker turns raw question lists into a private study system with state, memory, analytics, and repeatable review loops.</p>
            </div>
            <ProblemArtifact />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardContent className="p-6">
                <p className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">Static sheets</p>
                {["Solved state lives in one browser or spreadsheet.", "Revisions depend on memory.", "Notes are disconnected from questions.", "Progress totals do not explain weak areas."].map((item) => (
                  <div key={item} className="flex gap-3 border-t py-4 text-muted-foreground">
                    <ChevronRight className="mt-0.5 size-4" />
                    <span>{item}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="bg-primary text-primary-foreground">
              <CardContent className="p-6">
                <p className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-primary-foreground/70">DSA Tracker</p>
                {["Progress is scoped to the signed-in user.", "Revisions follow a fixed spaced ladder.", "Notes, bookmarks, confidence, and attempts stay attached.", "Analytics show what to practice next."].map((item) => (
                  <div key={item} className="flex gap-3 border-t border-primary-foreground/15 py-4 text-primary-foreground/85">
                    <CheckCircle2 className="mt-0.5 size-4" />
                    <span>{item}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="border-b py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Product pillars"
            title="Everything a serious DSA tracker should remember for you."
            description="The core product is intentionally quiet: less gamified noise, more useful state and progress clarity."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {pillars.map((feature) => (
              <Card key={feature.title}>
                <CardContent className="p-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="grid size-9 place-items-center rounded-full bg-muted">
                      <feature.icon className="size-4" />
                    </div>
                    <Badge variant="secondary" className="rounded-full text-[11px]">{feature.metric}</Badge>
                  </div>
                  <h3 className="text-base font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{feature.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="sheets" className="border-b py-20 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Sheets</p>
            <h2 className="editorial-heading text-4xl leading-tight sm:text-5xl">Start with Striver A2Z. Expand without redesigning the database.</h2>
            <p className="mt-5 text-muted-foreground">
              The first official sheet is Striver A2Z. The data model already separates global questions, sheet placement, and user progress so new sheets can be added cleanly.
            </p>
          </div>
          <SheetProgression />
        </div>
      </section>

      <section id="analytics" className="border-b py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Analytics"
            title="A dashboard that shows what your next hour should focus on."
            description="Progress visualization should motivate without hiding the hard truth: which topics are weak, which revisions are due, and whether consistency is improving."
          />
          <div className="mb-4 rounded-2xl border bg-primary p-5 text-primary-foreground shadow-xl shadow-stone-300/30 dark:shadow-black/30">
            <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground/60">Next hour recommendation</p>
                <h3 className="mt-2 text-2xl font-semibold">Revise 7 overdue DP questions before adding new solves.</h3>
                <p className="mt-2 text-sm text-primary-foreground/70">Based on weak confidence, missed review dates, and recent topic momentum.</p>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                {["7 due", "2/5 avg", "31m"].map((item) => (
                  <div key={item} className="rounded-xl border border-primary-foreground/15 bg-primary-foreground/10 px-4 py-3 text-sm font-medium">{item}</div>
                ))}
              </div>
            </div>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardContent className="p-6">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="text-xl font-semibold">Topic-wise progress</h3>
                  <Target className="size-5 text-muted-foreground" />
                </div>
                <div className="space-y-4">
                  {analyticsRows.map((row) => (
                    <div key={row.label}>
                      <div className="mb-1 flex justify-between text-sm">
                        <span>{row.label}</span>
                        <span className="text-muted-foreground">{Math.round((row.solved / row.total) * 100)}%</span>
                      </div>
                      <div className="h-3 rounded-full bg-muted">
                        <div className="h-3 rounded-full bg-primary" style={{ width: `${Math.round((row.solved / row.total) * 100)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="mb-5 text-xl font-semibold">Signal stack</h3>
                {[
                  ["Weekly trend", LineChart],
                  ["Solved split", CheckCircle2],
                  ["Heatmap", CalendarClock],
                  ["Sheet comparison", GitBranch],
                ].map(([label, Icon]) => (
                  <div key={String(label)} className="flex items-center gap-3 border-t py-4">
                    <Icon className="size-4 text-muted-foreground" />
                    <span className="text-sm">{String(label)}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section id="revisions" className="border-b py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Revisions"
            title="Remember what you solved, not just what you clicked."
            description="Solved questions enter a simple fixed review ladder so weak concepts keep resurfacing at the right time."
          />
          <div className="mb-4 rounded-2xl border bg-card p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="grid size-12 place-items-center rounded-full bg-primary text-primary-foreground">
                  <TimerReset className="size-5" />
                </span>
                <div>
                  <p className="font-semibold">Due today</p>
                  <p className="text-sm text-muted-foreground">7 questions need active recall before new practice.</p>
                </div>
              </div>
              <Badge className="w-fit rounded-full">Operational queue</Badge>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-5">
            {revisionSteps.map((step, index) => (
              <Card key={step.label} className={index === 1 ? "border-primary bg-primary text-primary-foreground" : ""}>
                <CardContent className="p-5">
                  <div className="mb-6 flex items-center justify-between">
                    <span className={["grid size-8 place-items-center rounded-full text-sm", index === 1 ? "bg-primary-foreground text-primary" : "bg-primary text-primary-foreground"].join(" ")}>{index + 1}</span>
                    <TimerReset className={["size-4", index === 1 ? "text-primary-foreground/70" : "text-muted-foreground"].join(" ")} />
                  </div>
                  <h3 className="font-semibold">{step.label}</h3>
                  <p className={["mt-2 text-sm", index === 1 ? "text-primary-foreground/70" : "text-muted-foreground"].join(" ")}>{step.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="security" className="border-b py-20 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_1fr] lg:px-8">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Privacy and auth</p>
            <h2 className="editorial-heading text-4xl leading-tight sm:text-5xl">Every serious tracker starts with private state.</h2>
            <p className="mt-5 text-muted-foreground">
              DSA Tracker keeps master question data separate from user progress. Logged-in users see only their own notes, bookmarks, revisions, streaks, and solution links.
            </p>
          </div>
          <div className="grid gap-4">
            <SecurityDiagram />
            <Card>
              <CardContent className="space-y-4 p-6">
              {[
                ["Logged-in only app routes", LockKeyhole],
                ["Private-by-default profiles", ShieldCheck],
                ["User-specific progress records", NotebookPen],
                ["Normalized imports for clean admin control", Database],
              ].map(([label, Icon]) => (
                <div key={String(label)} className="flex items-center gap-4 rounded-xl border bg-muted/40 p-4">
                  <div className="grid size-9 place-items-center rounded-full bg-card">
                    <Icon className="size-4" />
                  </div>
                  <span className="font-medium">{String(label)}</span>
                </div>
              ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="border-b py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardContent className="p-6 sm:p-8">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Data quality</p>
                <h2 className="editorial-heading text-4xl leading-tight">Built on normalized source imports.</h2>
                <p className="mt-4 max-w-2xl text-muted-foreground">
                  Questions, sheet placements, and user progress are modeled separately so importing richer metadata never corrupts personal progress.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="mb-5 grid size-10 place-items-center rounded-full bg-muted">
                  <Search className="size-5" />
                </div>
                <h3 className="text-lg font-semibold">Fast filters</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">Search by title, topic, difficulty, platform, bookmarks, solved state, and revision due state.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="editorial-heading text-4xl leading-tight sm:text-6xl">Turn your DSA sheet into a system you can trust.</h2>
          <p className="mx-auto mt-5 max-w-2xl text-muted-foreground">
            Create an account, open the official Striver A2Z sheet, and start tracking progress with revision discipline from day one.
          </p>
          <div className="mx-auto mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
            {["456 seeded questions", "Private progress", "Scheduled revisions"].map((proof) => (
              <div key={proof} className="rounded-xl border bg-card px-4 py-3 text-sm font-medium">{proof}</div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t py-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 text-sm text-muted-foreground sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <Link href="/" className="mb-2 flex items-center gap-2 font-semibold text-foreground">
              <BrandIcon className="size-7 rounded-[9px]" />
              DSA Tracker
            </Link>
            <p>Built for private, structured DSA preparation.</p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link href="/dashboard" className="hover:text-foreground">Dashboard</Link>
            <Link href="/sheets" className="hover:text-foreground">Sheets</Link>
            <Link href="/revisions" className="hover:text-foreground">Revisions</Link>
            <Link href="/leaderboard" className="hover:text-foreground">Leaderboard</Link>
            <Separator orientation="vertical" className="hidden h-5 sm:block" />
            <Link href="/login" className="hover:text-foreground">Login</Link>
            <Link href="/signup" className="hover:text-foreground">Signup</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
