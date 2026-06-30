import { Activity, CheckCircle2, Flame, RotateCcw, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/app-shell/page-header";
import { DashboardCharts, MonthActivityHeatmap } from "@/components/charts/dashboard-charts";
import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth/session";
import { getDashboardAnalyticsForUser } from "@/lib/db/queries";

export default async function DashboardPage() {
  const user = await requireUser();
  const analytics = await getDashboardAnalyticsForUser(user.id);

  return (
    <>
      <PageHeader
        eyebrow="Dashboard"
        title="Your DSA operating system"
        description="Track completion, revisions, streaks, and topic confidence across curated interview sheets."
      />
      <Card className="mb-6 border-primary/30 bg-primary text-primary-foreground">
        <CardContent className="grid gap-4 p-5 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground/60">Practice next</p>
            <h2 className="mt-2 text-2xl font-semibold">
              {analytics.revisionDue > 0
                ? `Review ${analytics.revisionDue} due questions before new solves.`
                : analytics.solvedCount > 0
                  ? "Continue Striver A2Z and schedule your next solve."
                  : "Open Striver A2Z and complete your first question."}
            </h2>
            <p className="mt-2 text-sm text-primary-foreground/70">
              {analytics.revisionDue > 0
                ? `${analytics.revisionUpcoming} upcoming revisions are already scheduled.`
                : analytics.solvedCount > 0
                  ? `${analytics.solvedCount} solved so far. Build enough activity for trends and difficulty splits to become meaningful.`
                  : "Your dashboard will become more useful as solved history and revisions accumulate."}
            </p>
          </div>
          <Button asChild variant="secondary" className="rounded-full">
            <a href={analytics.revisionDue > 0 ? "/revisions" : "/sheets"}>{analytics.revisionDue > 0 ? "Review now" : "Start sheet"}</a>
          </Button>
        </CardContent>
      </Card>
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Solved" value={analytics.solvedCount} detail={`${analytics.completion}% completion`} icon={CheckCircle2} tone="primary" />
        <StatCard label="Due revisions" value={analytics.revisionDue} detail={analytics.revisionDue > 0 ? "Due today" : `${analytics.revisionUpcoming} upcoming`} icon={RotateCcw} tone={analytics.revisionDue > 0 ? "urgent" : "default"} />
        <StatCard label="Weekly solved" value={analytics.weeklySolvedCount} detail="From your activity log" icon={TrendingUp} />
        <StatCard label="Average/day" value={analytics.averagePerDay} detail="Rolling estimate" icon={Activity} />
        <Card className="overflow-hidden border-orange-200/70 bg-gradient-to-br from-orange-50 via-card to-card dark:border-orange-500/20 dark:from-orange-950/20">
          <CardContent className="p-0">
            <div className="flex items-start justify-between p-5 pb-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current streak</p>
                <div className="mt-2 flex items-end gap-2">
                  <p className="text-4xl font-semibold tracking-tight">{analytics.currentStreak}</p>
                  <p className="pb-1 text-sm font-medium text-muted-foreground">days</p>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Best run: {analytics.longestStreak} days</p>
              </div>
              <div className="rounded-full bg-orange-500/10 p-2.5 text-orange-600 dark:text-orange-300">
                <Flame className="size-5" />
              </div>
            </div>
            <div className="border-t bg-background/45 p-3">
              {[
                { label: "LeetCode", value: analytics.platformStreaks.leetcode, bar: "bg-amber-500", tint: "bg-amber-500/10 text-amber-700 dark:text-amber-300" },
                { label: "GFG", value: analytics.platformStreaks.gfg, bar: "bg-emerald-500", tint: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" },
              ].map((platform) => {
                const width = analytics.currentStreak ? Math.min(100, Math.round((platform.value / analytics.currentStreak) * 100)) : 0;
                return (
                  <div key={platform.label} className="rounded-lg px-2 py-2">
                    <div className="mb-1.5 flex items-center justify-between gap-3">
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${platform.tint}`}>{platform.label}</span>
                      <span className="text-xs font-semibold">{platform.value}d</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted">
                      <div className={`h-1.5 rounded-full ${platform.bar}`} style={{ width: `${width}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
        <Card className="sm:col-span-2 xl:col-span-3">
          <CardHeader className="pb-3">
            <CardTitle>Daily activity</CardTitle>
          </CardHeader>
          <CardContent>
            <MonthActivityHeatmap heatmap={analytics.heatmap} />
          </CardContent>
        </Card>
      </div>
      <DashboardCharts analytics={analytics} />
    </>
  );
}
