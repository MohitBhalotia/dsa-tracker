import Link from "next/link";
import { CalendarDays, LockKeyhole, Settings } from "lucide-react";
import { PageHeader } from "@/components/app-shell/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { requireUser } from "@/lib/auth/session";
import { getDashboardAnalyticsForUser } from "@/lib/db/queries";

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const user = await requireUser();
  const analytics = await getDashboardAnalyticsForUser(user.id);
  const displayName = username === "me" ? user.name || user.email.split("@")[0] : username;

  return (
    <>
      <PageHeader
        eyebrow="Profile"
        title={`@${displayName}`}
        description="Profiles are private by default. Users can explicitly opt into public progress sharing later."
        actions={<Button asChild variant="outline" className="rounded-full"><Link href="/settings"><Settings className="size-4" /> Settings</Link></Button>}
      />
      <div className="mb-4 flex flex-wrap gap-2">
        <Badge variant="secondary" className="gap-1 rounded-full"><LockKeyhole className="size-3" /> Private profile</Badge>
        <Badge variant="outline" className="gap-1 rounded-full"><CalendarDays className="size-3" /> Last active appears after first solve</Badge>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardContent className="p-5"><p className="text-3xl font-semibold">{analytics.solvedCount}</p><p className="text-muted-foreground">Solved</p><p className="mt-2 text-xs text-muted-foreground">Solve your first problem to populate this card.</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-3xl font-semibold">{analytics.currentStreak}d</p><p className="text-muted-foreground">Current streak</p><p className="mt-2 text-xs text-muted-foreground">Daily activity builds your habit signal.</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-3xl font-semibold">{analytics.completion}%</p><p className="text-muted-foreground">A2Z completion</p><p className="mt-2 text-xs text-muted-foreground">Progress updates as you mark questions solved.</p></CardContent></Card>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card><CardContent className="p-5"><h2 className="font-semibold">Strongest topics</h2><p className="mt-2 text-sm text-muted-foreground">Topic badges appear after solved history is available.</p></CardContent></Card>
        <Card><CardContent className="p-5"><h2 className="font-semibold">Recent solves</h2><p className="mt-2 text-sm text-muted-foreground">Your latest completed problems will show here.</p></CardContent></Card>
        <Card><CardContent className="p-5"><h2 className="font-semibold">Badges</h2><p className="mt-2 text-sm text-muted-foreground">Consistency and revision badges are planned for sharing.</p></CardContent></Card>
      </div>
    </>
  );
}
