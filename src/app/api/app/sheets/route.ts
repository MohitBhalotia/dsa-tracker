import { NextResponse } from "next/server";
import { apiError, requireApiUser } from "@/lib/api/http";
import { getAllSheetsForUser } from "@/lib/db/queries";

export async function GET() {
  const { user, response } = await requireApiUser();
  if (response) return response;

  try {
    const sheets = await getAllSheetsForUser(user.id);
    return NextResponse.json(sheets);
  } catch (error) {
    return apiError(error);
  }
}
