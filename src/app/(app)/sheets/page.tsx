import Link from "next/link";
import { ArrowRight, Layers3, Route } from "lucide-react";
import { PageHeader } from "@/components/app-shell/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { requireUser } from "@/lib/auth/session";
import { getAllSheetsForUser } from "@/lib/db/queries";

export default async function SheetsPage() {
  const user = await requireUser();
  const [sheet] = await getAllSheetsForUser(user.id);

  return (
    <>
      <PageHeader
        eyebrow="Sheets"
        title="Curated interview roadmaps"
        description="Start with Striver A2Z today. The architecture is ready for Blind 75, NeetCode 150, company lists, and private sheets."
        actions={<div className="rounded-full border bg-card px-4 py-2 text-sm text-muted-foreground">1 active sheet - 3 upcoming</div>}
      />
      <Card className="overflow-hidden border-primary/20">
        <CardContent className="grid gap-6 p-6 md:grid-cols-[1fr_auto] md:items-start">
          <div>
            <div className="mb-3 flex flex-wrap gap-2">
              {sheet.tags.map((tag: string) => <Badge key={tag} variant="secondary">{tag[0].toUpperCase() + tag.slice(1)}</Badge>)}
            </div>
            <h2 className="text-2xl font-semibold">{sheet.title}</h2>
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{sheet.description.slice(0, 260)}...</p>
          </div>
          <div className="flex flex-col items-start gap-4 md:items-end">
            <div className="grid size-24 place-items-center rounded-full border-8 border-muted text-center">
              <div>
                <p className="text-2xl font-semibold">{sheet.completion}%</p>
                <p className="text-xs text-muted-foreground">complete</p>
              </div>
            </div>
            <Button asChild className="rounded-full">
              <Link href={`/sheets/${sheet.slug}`}>Open <ArrowRight className="size-4" /></Link>
            </Button>
          </div>
        </CardContent>
      </Card>
      <div className="mt-6 rounded-xl border bg-card p-5">
        <div className="mb-4 flex items-center gap-2 text-sm font-medium">
          <Layers3 className="size-4" />
          Coming Soon
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {["Blind 75", "NeetCode 150", "Company Sheets"].map((item) => (
            <div key={item} className="flex items-center gap-3 rounded-xl border bg-muted/30 p-3 text-sm">
              <Route className="size-4 text-muted-foreground" />
              <div>
                <p className="font-medium">{item}</p>
                <p className="text-xs text-muted-foreground"></p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
