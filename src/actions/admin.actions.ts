"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase, isDatabaseConfigured } from "@/lib/db/mongoose";
import { seed } from "@/lib/seed/data";
import { Question } from "@/models/question.model";
import { Sheet } from "@/models/sheet.model";
import { SheetItem } from "@/models/sheet-item.model";
import { SheetSection } from "@/models/sheet-section.model";
import { SheetSubTopic } from "@/models/sheet-sub-topic.model";

export async function importStriverSeed() {
  if (!isDatabaseConfigured()) {
    console.info("MONGODB_URI is not configured. Seed JSON is ready, but database import was skipped.");
    return;
  }

  await connectToDatabase();

  const sheet = await Sheet.findOneAndUpdate(
    { slug: seed.sheet.slug },
    {
      title: seed.sheet.title,
      slug: seed.sheet.slug,
      description: seed.sheet.description,
      source: seed.sheet.source,
      sourceUrl: seed.sheet.sourceUrl,
      banner: seed.sheet.banner,
      visibility: seed.sheet.visibility,
      isOfficial: seed.sheet.isOfficial,
      version: seed.sheet.version,
      tags: seed.sheet.tags,
      totalQuestions: seed.sheet.totalQuestions,
    },
    { upsert: true, new: true },
  );

  const sectionIdMap = new Map<string, string>();
  for (const section of seed.sections) {
    const doc = await SheetSection.findOneAndUpdate(
      { sheetId: sheet._id, sourceId: section.id },
      { sheetId: sheet._id, sourceId: section.id, title: section.title, slug: section.slug, order: section.order },
      { upsert: true, new: true },
    );
    sectionIdMap.set(section.id, doc._id.toString());
  }

  const subTopicIdMap = new Map<string, string>();
  for (const subTopic of seed.subTopics) {
    const doc = await SheetSubTopic.findOneAndUpdate(
      { sheetId: sheet._id, sourceId: subTopic.id },
      {
        sheetId: sheet._id,
        sectionId: sectionIdMap.get(subTopic.sectionId),
        sourceId: subTopic.id,
        title: subTopic.title,
        slug: subTopic.slug,
        order: subTopic.order,
      },
      { upsert: true, new: true },
    );
    subTopicIdMap.set(subTopic.id, doc._id.toString());
  }

  const questionIdMap = new Map<string, string>();
  for (const question of seed.questions) {
    const doc = await Question.findOneAndUpdate(
      { sourceId: question.id },
      { ...question, sourceId: question.id },
      { upsert: true, new: true },
    );
    questionIdMap.set(question.id, doc._id.toString());
  }

  for (const item of seed.sheetItems) {
    await SheetItem.findOneAndUpdate(
      { sheetId: sheet._id, sourceId: item.id },
      {
        sourceId: item.id,
        sheetId: sheet._id,
        questionId: questionIdMap.get(item.questionId),
        sectionId: sectionIdMap.get(item.sectionId),
        subTopicId: subTopicIdMap.get(item.subTopicId),
        order: item.order,
        displayTitle: item.displayTitle,
        legacyQuestionId: item.legacyQuestionId,
        matchMethod: item.matchMethod,
      },
      { upsert: true, new: true },
    );
  }

  revalidatePath("/admin");
  revalidatePath("/sheets");
}
