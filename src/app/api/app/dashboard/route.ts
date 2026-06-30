import { NextResponse } from "next/server";
import { apiError, requireApiUser } from "@/lib/api/http";
import { getDashboardAnalyticsForUser } from "@/lib/db/queries";

export async function GET() {
  const { user, response } = await requireApiUser();
  if (response) return response;

  try {
    const analytics = await getDashboardAnalyticsForUser(user.id);
    return NextResponse.json(analytics);
  } catch (error) {
    return apiError(error);
  }
}
