import { NextResponse } from "next/server";
import { apiError, requireApiUser } from "@/lib/api/http";
import { getPrimarySheet, getRevisionQueueForUser } from "@/lib/db/queries";

export async function GET() {
  const { user, response } = await requireApiUser();
  if (response) return response;

  try {
    const [questions, sheet] = await Promise.all([getRevisionQueueForUser(user.id), getPrimarySheet()]);
    return NextResponse.json({ questions, sheet });
  } catch (error) {
    return apiError(error);
  }
}
