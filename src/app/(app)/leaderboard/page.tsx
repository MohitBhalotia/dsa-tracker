import { PageHeader } from "@/components/app-shell/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const rows = [
  ["Aarav", 312, 24, 9820],
  ["Maya", 291, 18, 9210],
  ["You", 0, 0, 0],
  ["Ishan", 188, 11, 7110],
];

export default function LeaderboardPage() {
  return (
    <>
      <PageHeader
        eyebrow="Leaderboard"
        title="Monthly rankings"
        description="Schema-ready social architecture. Full friend and comparison flows can be enabled after core tracking stabilizes."
        actions={<Badge variant="secondary" className="rounded-full">Demo data · social preview</Badge>}
      />
      <div className="mb-4 flex flex-wrap gap-2">
        {["Friends", "Global", "Monthly"].map((scope, index) => (
          <Badge key={scope} variant={index === 2 ? "default" : "outline"} className="rounded-full px-3 py-1">{scope}</Badge>
        ))}
      </div>
      <Card>
        <CardContent className="divide-y p-0">
          <div className="grid grid-cols-[48px_1fr_100px_100px_100px] items-center gap-3 bg-muted/50 p-4 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            <span>Rank</span>
            <span>User</span>
            <span>Solved</span>
            <span>Streak</span>
            <span className="text-right">Score</span>
          </div>
          {rows.map(([name, solved, streak, score], index) => (
            <div key={name} className={["grid grid-cols-[48px_1fr_100px_100px_100px] items-center gap-3 p-4 text-sm", name === "You" ? "bg-primary/10" : ""].join(" ")}>
              <span className="font-mono text-muted-foreground">#{index + 1}</span>
              <span className="font-medium">{name}{name === "You" ? <span className="ml-2 text-xs text-muted-foreground">9,210 points to next tracked rank</span> : null}</span>
              <span>{solved} solved</span>
              <span>{streak}d streak</span>
              <span className="text-right font-semibold">{score}</span>
            </div>
          ))}
        </CardContent>
      </Card>
      <p className="mt-3 text-xs text-muted-foreground">Score preview: solved count weighted by consistency, with streak bonuses planned for monthly rankings.</p>
    </>
  );
}
