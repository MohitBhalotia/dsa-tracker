import { NextResponse } from "next/server";
import { apiError, requireApiUser } from "@/lib/api/http";
import { getFilterOptionsForUser, getPrimarySheet, getQuestionsForUser, type SheetFilters } from "@/lib/db/queries";

export async function GET(request: Request, { params }: { params: Promise<{ sheetSlug: string }> }) {
  const { user, response } = await requireApiUser();
  if (response) return response;

  try {
    const { sheetSlug } = await params;
    const url = new URL(request.url);
    const filters: SheetFilters = {
      query: url.searchParams.get("q") || undefined,
      topic: url.searchParams.get("topic") || undefined,
      difficulty: (url.searchParams.get("difficulty") || undefined) as SheetFilters["difficulty"],
      platform: url.searchParams.get("platform") || undefined,
      company: url.searchParams.get("company") || undefined,
      solved: (url.searchParams.get("solved") || undefined) as SheetFilters["solved"],
      bookmarked: (url.searchParams.get("bookmarked") || undefined) as SheetFilters["bookmarked"],
      sort: (url.searchParams.get("sort") || undefined) as SheetFilters["sort"],
    };
    const [sheet, options, questions] = await Promise.all([
      getPrimarySheet(),
      getFilterOptionsForUser(user.id),
      getQuestionsForUser(user.id, filters),
    ]);
    const dueCount = questions.filter((question) => question.nextRevisionAt && new Date(question.nextRevisionAt) <= new Date()).length;

    return NextResponse.json({
      basePath: `/sheets/${sheetSlug}`,
      title: sheet.title,
      description: sheet.description,
      options,
      filters,
      questions,
      sheetSlug: sheet.slug,
      totalCount: sheet.totalQuestions,
      dueCount,
    });
  } catch (error) {
    return apiError(error);
  }
}
