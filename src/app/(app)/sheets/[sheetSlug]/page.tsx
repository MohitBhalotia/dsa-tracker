import { SheetWorkspace } from "@/components/sheets/sheet-workspace";
import { requireUser } from "@/lib/auth/session";
import { getFilterOptionsForUser, getPrimarySheet, getQuestionsForUser, type SheetFilters } from "@/lib/db/queries";

export default async function SheetDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ sheetSlug: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { sheetSlug } = await params;
  const user = await requireUser();
  const query = await searchParams;
  const [sheet, options] = await Promise.all([getPrimarySheet(), getFilterOptionsForUser(user.id)]);
  const filters: SheetFilters = {
    query: query.q,
    topic: query.topic,
    difficulty: query.difficulty as SheetFilters["difficulty"],
    platform: query.platform,
    company: query.company,
    solved: query.solved as SheetFilters["solved"],
    bookmarked: query.bookmarked as SheetFilters["bookmarked"],
    sort: query.sort as SheetFilters["sort"],
  };
  const questions = await getQuestionsForUser(user.id, filters);
  const dueCount = questions.filter((question) => question.nextRevisionAt && new Date(question.nextRevisionAt) <= new Date()).length;

  return (
    <SheetWorkspace
      basePath={`/sheets/${sheetSlug}`}
      title={sheet.title}
      description={sheet.description}
      options={options}
      filters={filters}
      questions={questions}
      sheetSlug={sheet.slug}
      totalCount={sheet.totalQuestions}
      dueCount={dueCount}
    />
  );
}
