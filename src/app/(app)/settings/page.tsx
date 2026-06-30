import { PageHeader } from "@/components/app-shell/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function SettingsPage() {
  return (
    <>
      <PageHeader eyebrow="Settings" title="Account preferences" description="Private defaults, timezone-aware streaks, and product-grade account settings." />
      <div className="mb-4 rounded-xl border bg-muted/30 p-3 text-sm text-muted-foreground">
        Preference persistence is partially wired. Profile and privacy controls are shown as product-ready settings surfaces; save behavior should be connected before production launch.
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label>Username</Label><Input placeholder="your-username" /></div>
            <div className="space-y-2">
              <Label>Timezone</Label>
              <select className="h-11 w-full rounded-xl border bg-background px-3 text-sm">
                <option>Asia/Calcutta</option>
                <option>UTC</option>
                <option>America/New_York</option>
                <option>Europe/London</option>
              </select>
              <p className="text-xs text-muted-foreground">Used for streak cutoff and daily activity grouping.</p>
            </div>
            <Button className="rounded-full">Save preferences</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Privacy</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div><p className="font-medium">Public profile</p><p className="text-sm text-muted-foreground">Would expose your display name, solved totals, streak, and public badges after confirmation.</p></div>
              <Switch />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div><p className="flex items-center gap-2 font-medium">Leaderboard visibility <Badge variant="secondary">Coming soon</Badge></p><p className="text-sm text-muted-foreground">Disabled until social rankings launch.</p></div>
              <Switch disabled />
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
