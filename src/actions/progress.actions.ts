"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { connectToDatabase } from "@/lib/db/mongoose";
import { requireUser } from "@/lib/auth/session";
import { getNextRevisionDate } from "@/lib/revisions";
import { ActivityLog } from "@/models/activity-log.model";
import { Bookmark } from "@/models/bookmark.model";
import { Question } from "@/models/question.model";
import { Revision } from "@/models/revision.model";
import { Sheet } from "@/models/sheet.model";
import { UserProgress } from "@/models/user-progress.model";

const progressInput = z.object({
  sheetSlug: z.string().min(1).default("strivers-a2z-dsa-sheet"),
  questionSourceId: z.string().min(1),
});

async function resolveRefs(input: z.infer<typeof progressInput>) {
  await connectToDatabase();
  const sheet = await Sheet.findOne({ slug: input.sheetSlug });
  const question = await Question.findOne({ sourceId: input.questionSourceId });
  if (!sheet || !question) throw new Error("Sheet or question was not imported yet.");
  return { sheet, question };
}

export async function toggleSolved(rawInput: z.input<typeof progressInput>) {
  const user = await requireUser();
  const input = progressInput.parse(rawInput);
  const { sheet, question } = await resolveRefs(input);
  const existing = await UserProgress.findOne({ userId: user.id, sheetId: sheet._id, questionId: question._id });
  const nextSolved = existing?.status !== "solved";
  const now = new Date();

  await UserProgress.findOneAndUpdate(
    { userId: user.id, sheetId: sheet._id, questionId: question._id },
    {
      userId: user.id,
      sheetId: sheet._id,
      questionId: question._id,
      status: nextSolved ? "solved" : "unsolved",
      solvedAt: nextSolved ? existing?.solvedAt || now : null,
      lastSolvedAt: nextSolved ? now : null,
      revisionStage: nextSolved ? 0 : existing?.revisionStage || 0,
      nextRevisionAt: nextSolved ? getNextRevisionDate(0, now) : null,
    },
    { upsert: true, new: true },
  );

  await ActivityLog.create({
    userId: user.id,
    sheetId: sheet._id,
    questionId: question._id,
    type: nextSolved ? "solved" : "unsolved",
    occurredAt: now,
    localDate: now.toISOString().slice(0, 10),
  });

  revalidatePath("/dashboard");
  revalidatePath("/sheets");
  return { ok: true, solved: nextSolved };
}

export async function toggleBookmark(rawInput: z.input<typeof progressInput>) {
  const user = await requireUser();
  const input = progressInput.parse(rawInput);
  const { sheet, question } = await resolveRefs(input);
  const existing = await Bookmark.findOne({ userId: user.id, sheetId: sheet._id, questionId: question._id });
  if (existing) {
    await existing.deleteOne();
  } else {
    await Bookmark.create({ userId: user.id, sheetId: sheet._id, questionId: question._id });
  }
  revalidatePath("/sheets");
  return { ok: true, bookmarked: !existing };
}

export async function updateQuestionNotes(formData: FormData) {
  const user = await requireUser();
  const input = progressInput.parse({
    sheetSlug: String(formData.get("sheetSlug") || "strivers-a2z-dsa-sheet"),
    questionSourceId: String(formData.get("questionSourceId") || ""),
  });
  const notes = z.string().max(20_000).parse(String(formData.get("notes") || ""));
  const { sheet, question } = await resolveRefs(input);

  await UserProgress.findOneAndUpdate(
    { userId: user.id, sheetId: sheet._id, questionId: question._id },
    { userId: user.id, sheetId: sheet._id, questionId: question._id, notes },
    { upsert: true },
  );

  await ActivityLog.create({
    userId: user.id,
    sheetId: sheet._id,
    questionId: question._id,
    type: "note_updated",
    localDate: new Date().toISOString().slice(0, 10),
  });

  revalidatePath(`/questions/${input.questionSourceId}`);
  revalidatePath(`/sheets/${input.sheetSlug}`);
}

export async function recordRevision(rawInput: z.input<typeof progressInput>) {
  const user = await requireUser();
  const input = progressInput.parse(rawInput);
  const { sheet, question } = await resolveRefs(input);
  const progress = await UserProgress.findOne({ userId: user.id, sheetId: sheet._id, questionId: question._id });
  const nextStage = (progress?.revisionStage || 0) + 1;
  const now = new Date();

  await Revision.create({
    userId: user.id,
    sheetId: sheet._id,
    questionId: question._id,
    scheduledFor: progress?.nextRevisionAt || now,
    completedAt: now,
    status: "completed",
    stage: nextStage,
  });

  await UserProgress.findOneAndUpdate(
    { userId: user.id, sheetId: sheet._id, questionId: question._id },
    { revisionStage: nextStage, revisionCount: nextStage, lastReviewedAt: now, nextRevisionAt: getNextRevisionDate(nextStage, now) },
    { upsert: true },
  );

  await ActivityLog.create({
    userId: user.id,
    sheetId: sheet._id,
    questionId: question._id,
    type: "revision_completed",
    localDate: now.toISOString().slice(0, 10),
  });

  revalidatePath("/revisions");
  return { ok: true };
}

export async function toggleSolvedFromForm(formData: FormData) {
  await toggleSolved({
    sheetSlug: String(formData.get("sheetSlug") || "strivers-a2z-dsa-sheet"),
    questionSourceId: String(formData.get("questionSourceId") || ""),
  });
}

export async function toggleBookmarkFromForm(formData: FormData) {
  await toggleBookmark({
    sheetSlug: String(formData.get("sheetSlug") || "strivers-a2z-dsa-sheet"),
    questionSourceId: String(formData.get("questionSourceId") || ""),
  });
}

export async function recordRevisionFromForm(formData: FormData) {
  await recordRevision({
    sheetSlug: String(formData.get("sheetSlug") || "strivers-a2z-dsa-sheet"),
    questionSourceId: String(formData.get("questionSourceId") || ""),
  });
}
