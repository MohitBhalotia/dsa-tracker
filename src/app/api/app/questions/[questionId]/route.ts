import { NextResponse } from "next/server";
import { apiError, requireApiUser } from "@/lib/api/http";
import { getPrimarySheet, getQuestionForUser } from "@/lib/db/queries";

export async function GET(_request: Request, { params }: { params: Promise<{ questionId: string }> }) {
  const { user, response } = await requireApiUser();
  if (response) return response;

  try {
    const { questionId } = await params;
    const [question, sheet] = await Promise.all([getQuestionForUser(user.id, questionId), getPrimarySheet()]);
    if (!question) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ question, sheet });
  } catch (error) {
    return apiError(error);
  }
}
