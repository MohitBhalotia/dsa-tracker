import { NextResponse } from "next/server";
import { seed } from "@/lib/seed/data";

export async function GET() {
  return NextResponse.json({
    generatedAt: seed.generatedAt,
    totalQuestions: seed.sheetItems.length,
    warnings: seed.importWarnings,
  });
}
