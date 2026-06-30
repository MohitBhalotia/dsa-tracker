import crypto from "node:crypto";
import { Database, FileJson, ShieldAlert } from "lucide-react";
import { importStriverSeed } from "@/actions/admin.actions";
import { PageHeader } from "@/components/app-shell/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { seed } from "@/lib/seed/data";
import { requireUser } from "@/lib/auth/session";

export default async function AdminPage() {
  const user = await requireUser();
  const canImport = user.role === "admin" || process.env.NODE_ENV === "development";
  const checksum = crypto.createHash("sha256").update(JSON.stringify(seed)).digest("hex").slice(0, 12);
  const generatedAt = new Date().toISOString().slice(0, 10);
  const warningRows = seed.importWarnings.slice(0, 12);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <PageHeader
        eyebrow="Admin"
        title="Sheet import control"
        description="Review the generated normalized seed file, then import it into MongoDB when environment variables are configured."
        actions={<div className="flex gap-2"><span className="rounded-full bg-primary px-3 py-1 text-sm text-primary-foreground">Admin-only</span><span className="rounded-full border px-3 py-1 text-sm text-muted-foreground">{process.env.NODE_ENV}</span></div>}
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><FileJson className="size-5" /> Seed artifact</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>{seed.sheetItems.length}</strong> sheet items</p>
            <p><strong>{seed.sections.length}</strong> sections</p>
            <p><strong>{seed.subTopics.length}</strong> subtopics</p>
            <p><strong>{seed.importWarnings.length}</strong> warning(s)</p>
            <p><strong>src/data/striver-a2z.seed.json</strong></p>
            <p className="text-muted-foreground">Generated {generatedAt} · checksum {checksum}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Database className="size-5" /> Mongo import</CardTitle></CardHeader>
          <CardContent>
            {canImport ? (
              <details className="rounded-xl border bg-muted/30 p-3">
                <summary className="cursor-pointer text-sm font-medium">Review import confirmation</summary>
                <div className="mt-3 space-y-3 text-sm text-muted-foreground">
                  <p>This upserts sheets, sections, subtopics, questions, and sheet items. Existing deterministic records are updated idempotently.</p>
                  <form action={importStriverSeed}>
                    <Button className="rounded-full">Import Striver seed</Button>
                  </form>
                </div>
              </details>
            ) : (
              <Button className="rounded-full" disabled>Import disabled</Button>
            )}
            <p className="mt-3 text-sm text-muted-foreground">Requires `MONGODB_URI`. Import is hidden outside admin/development context.</p>
          </CardContent>
        </Card>
        <Alert variant={canImport ? "default" : "destructive"}>
          <ShieldAlert className="size-4" />
          <AlertTitle>Admin protection</AlertTitle>
          <AlertDescription>
            {canImport ? "Role-aware import controls are visible in this environment." : "Import controls are blocked because this user is not an admin."}
          </AlertDescription>
        </Alert>
      </div>
      <Card className="mt-4">
        <CardHeader><CardTitle>Import warnings</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-xl border">
            <div className="grid grid-cols-[120px_1fr_1fr] gap-3 bg-muted/50 p-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              <span>Severity</span>
              <span>Source row</span>
              <span>Fix suggestion</span>
            </div>
            {warningRows.map((warning, index) => (
              <div key={index} className="grid grid-cols-[120px_1fr_1fr] gap-3 border-t p-3 text-sm">
                <span className="font-medium">Warning</span>
                <span className="truncate">{JSON.stringify(warning).slice(0, 120)}</span>
                <span className="text-muted-foreground">Review source metadata and rerun seed generation.</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
