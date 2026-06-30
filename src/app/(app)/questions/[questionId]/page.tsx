import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { Bookmark, CalendarClock, CheckCircle2, ExternalLink, RotateCcw, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/app-shell/page-header";
import { PlatformIcon } from "@/components/resources/platform-icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { recordRevisionFromForm, toggleBookmarkFromForm, toggleSolvedFromForm, updateQuestionNotes } from "@/actions/progress.actions";
import { requireUser } from "@/lib/auth/session";
import { getPrimarySheet, getQuestionForUser } from "@/lib/db/queries";

export default async function QuestionPage({ params }: { params: Promise<{ questionId: string }> }) {
  const { questionId } = await params;
  const user = await requireUser();
  const [question, sheet] = await Promise.all([getQuestionForUser(user.id, questionId), getPrimarySheet()]);
  if (!question) notFound();

  const nextRevisionLabel = question.nextRevisionAt ? new Date(question.nextRevisionAt).toLocaleDateString() : "Scheduled after solve";
  const notes = question.notes || `### Constraints

- 

### Pattern

- 

### Edge cases

- 

### Complexity

- Time:
- Space:

### Recall notes

- `;

  return (
    <>
      <PageHeader
        eyebrow={question.sectionTitle}
        title={question.title}
        description={question.canonicalTitle}
        actions={<Button asChild variant="outline" className="rounded-full"><Link href={`/sheets/${sheet.slug}`}>Back to sheet</Link></Button>}
      />
      <div className="mb-6 flex flex-wrap gap-2">
        <Badge>{question.difficulty}</Badge>
        <Badge variant="secondary">{question.platform}</Badge>
        <Badge variant="outline">{question.subTopicTitle}</Badge>
        {question.topics.slice(0, 4).map((topic) => <Badge key={topic} variant="secondary">{topic}</Badge>)}
        {question.companyTags.slice(0, 4).map((company) => <Badge key={company} variant="outline">{company}</Badge>)}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle>Learning resources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2 sm:grid-cols-2">
              {question.links.map((link) => (
                <Button key={link.url} asChild variant={link.primary ? "default" : "outline"} className="justify-between gap-3 rounded-full">
                  <a href={link.url} target="_blank" rel="noreferrer">
                    <span className="flex min-w-0 items-center gap-2">
                      <PlatformIcon platform={`${link.platform || ""} ${link.label} ${link.url}`} className="size-6 shrink-0" />
                      <span className="truncate">{link.label}</span>
                    </span>
                    <ExternalLink className="size-4 shrink-0" />
                  </a>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><RotateCcw className="size-4" /> Revision state</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="rounded-xl border bg-muted/40 p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-medium">Next review</span>
                <Badge className="rounded-full" variant={question.nextRevisionAt ? "default" : "secondary"}>{question.nextRevisionAt ? "Scheduled" : "After solve"}</Badge>
              </div>
              <p className="text-muted-foreground">{nextRevisionLabel}</p>
            </div>
            <div className="flex justify-between"><span className="text-muted-foreground">Revisions</span><span>{question.revisionCount}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Confidence</span><span>{question.confidence ?? "Not set"}</span></div>
            <div className="grid grid-cols-5 gap-1">
              {[1, 2, 3, 4, 5].map((level) => (
                <div key={level} className={["h-2 rounded-full", question.confidence && question.confidence >= level ? "bg-primary" : "bg-muted"].join(" ")} />
              ))}
            </div>
            <form action={recordRevisionFromForm}>
              <input type="hidden" name="questionSourceId" value={question.id} />
              <input type="hidden" name="sheetSlug" value={sheet.slug} />
              <Button className="w-full rounded-full" variant="outline">Record revision</Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Tracking controls</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
            <div className="flex gap-3">
              <div className="grid size-10 place-items-center rounded-full bg-muted">
                {question.solved ? <CheckCircle2 className="size-5 text-emerald-600" /> : <CalendarClock className="size-5 text-muted-foreground" />}
              </div>
              <div>
                <p className="font-medium">{question.solved ? "Solved question" : "Ready to solve"}</p>
                <p className="text-sm text-muted-foreground">
                  Marking solved creates your progress record and schedules the first revision for tomorrow.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <form action={toggleSolvedFromForm}>
                <input type="hidden" name="questionSourceId" value={question.id} />
                <input type="hidden" name="sheetSlug" value={sheet.slug} />
                <Button className="rounded-full" variant={question.solved ? "outline" : "default"}>
                  {question.solved ? "Mark unsolved" : "Mark solved"}
                </Button>
              </form>
              <form action={toggleBookmarkFromForm}>
                <input type="hidden" name="questionSourceId" value={question.id} />
                <input type="hidden" name="sheetSlug" value={sheet.slug} />
                <Button className="rounded-full" variant="outline">
                  <Bookmark className="size-4" />
                  {question.bookmarked ? "Remove bookmark" : "Bookmark"}
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Sparkles className="size-4" /> Recall notes</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 lg:grid-cols-2">
            <form action={updateQuestionNotes} className="space-y-3">
              <input type="hidden" name="questionSourceId" value={question.id} />
              <input type="hidden" name="sheetSlug" value={sheet.slug} />
              <Textarea name="notes" defaultValue={notes} className="min-h-64 font-mono text-sm" />
              <Button className="rounded-full">Save notes</Button>
            </form>
            <div className="prose prose-stone max-w-none rounded-xl border bg-muted/40 p-4 text-sm dark:prose-invert">
              <ReactMarkdown>{notes}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
