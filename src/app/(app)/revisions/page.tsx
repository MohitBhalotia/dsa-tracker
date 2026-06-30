import Link from "next/link";
import { ArrowRight, TimerReset } from "lucide-react";
import { PageHeader } from "@/components/app-shell/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { recordRevisionFromForm } from "@/actions/progress.actions";
import { requireUser } from "@/lib/auth/session";
import { getPrimarySheet, getRevisionQueueForUser } from "@/lib/db/queries";

export default async function RevisionsPage() {
  const user = await requireUser();
  const [questions, sheet] = await Promise.all([getRevisionQueueForUser(user.id), getPrimarySheet()]);

  return (
    <>
      <PageHeader eyebrow="Revisions" title="Today's review queue" description="Spaced repetition follows the fixed review ladder after a solve." />
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium">
            <TimerReset className="size-4" />
            Revision ladder
          </div>
          <div className="grid gap-2 sm:grid-cols-5">
            {["1 day", "3 days", "7 days", "15 days", "30 days"].map((step, index) => (
              <div key={step} className="rounded-xl border bg-muted/30 p-3 text-sm">
                <p className="font-semibold">Review {index + 1}</p>
                <p className="text-muted-foreground">{step}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {!questions.length ? (
        <Card>
          <CardContent className="grid gap-5 p-8 text-center">
            <div className="mx-auto grid size-14 place-items-center rounded-full bg-muted">
              <TimerReset className="size-6 text-muted-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">No revisions yet</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                Solve a question first. DSA Tracker will schedule your first review for the next day and build this queue automatically.
              </p>
            </div>
            <div className="flex justify-center gap-2">
              <Button asChild className="rounded-full">
                <Link href={`/sheets/${sheet.slug}`}>Open sheet <ArrowRight className="size-4" /></Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <Link href="/dashboard">Back to dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-3">
        {questions.map((question, index) => (
          <Card key={question.id}>
            <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="mb-2 flex gap-2"><Badge>{index < 4 ? "Due today" : index < 8 ? "Upcoming" : "Overdue"}</Badge><Badge variant="secondary">{question.difficulty}</Badge></div>
                <Link href={`/questions/${question.id}`} className="font-medium hover:underline">{question.title}</Link>
                <p className="text-sm text-muted-foreground">{question.sectionTitle}</p>
              </div>
              <form action={recordRevisionFromForm}>
                <input type="hidden" name="questionSourceId" value={question.id} />
                <input type="hidden" name="sheetSlug" value={sheet.slug} />
                <Button variant="outline" className="rounded-full">Record revision</Button>
              </form>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
