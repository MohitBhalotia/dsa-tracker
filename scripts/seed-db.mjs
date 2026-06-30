import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { MongoClient, ObjectId } from "mongodb";

const root = process.cwd();
const envPath = path.join(root, ".env");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index === -1) continue;
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim().replace(/^["']|["']$/g, "");
    process.env[key] ??= value;
  }
}

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI is missing from .env");
}

const seedPath = path.join(root, "src", "data", "striver-a2z.seed.json");
const seed = JSON.parse(fs.readFileSync(seedPath, "utf8"));
const client = new MongoClient(process.env.MONGODB_URI);

const objectIdFor = (prefix, id) => {
  return new ObjectId(crypto.createHash("md5").update(`${prefix}:${id}`).digest("hex").slice(0, 24));
};

try {
  await client.connect();
  const db = client.db();
  const now = new Date();

  const existingSheet = await db.collection("sheets").findOne({ slug: seed.sheet.slug }, { projection: { _id: 1 } });
  const sheetObjectId = existingSheet?._id || objectIdFor("sheet", seed.sheet.id);
  await db.collection("sheets").updateOne(
    { slug: seed.sheet.slug },
    {
      $set: {
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
        updatedAt: now,
      },
      $setOnInsert: { _id: sheetObjectId, createdAt: now },
    },
    { upsert: true },
  );

  const sectionIds = new Map();
  for (const section of seed.sections) {
    const existing = await db.collection("sheetsections").findOne({ sheetId: sheetObjectId, sourceId: section.id }, { projection: { _id: 1 } });
    const _id = existing?._id || objectIdFor("section", section.id);
    sectionIds.set(section.id, _id);
    await db.collection("sheetsections").updateOne(
      { sheetId: sheetObjectId, sourceId: section.id },
      {
        $set: { sheetId: sheetObjectId, sourceId: section.id, title: section.title, slug: section.slug, order: section.order, updatedAt: now },
        $setOnInsert: { _id, createdAt: now },
      },
      { upsert: true },
    );
  }

  const subTopicIds = new Map();
  for (const subTopic of seed.subTopics) {
    const existing = await db.collection("sheetsubtopics").findOne({ sheetId: sheetObjectId, sourceId: subTopic.id }, { projection: { _id: 1 } });
    const _id = existing?._id || objectIdFor("subtopic", subTopic.id);
    subTopicIds.set(subTopic.id, _id);
    await db.collection("sheetsubtopics").updateOne(
      { sheetId: sheetObjectId, sourceId: subTopic.id },
      {
        $set: {
          sheetId: sheetObjectId,
          sectionId: sectionIds.get(subTopic.sectionId),
          sourceId: subTopic.id,
          title: subTopic.title,
          slug: subTopic.slug,
          order: subTopic.order,
          updatedAt: now,
        },
        $setOnInsert: { _id, createdAt: now },
      },
      { upsert: true },
    );
  }

  const questionIds = new Map();
  for (const question of seed.questions) {
    const existing = await db.collection("questions").findOne({ sourceId: question.id }, { projection: { _id: 1 } });
    const _id = existing?._id || objectIdFor("question", question.id);
    questionIds.set(question.id, _id);
    await db.collection("questions").updateOne(
      { sourceId: question.id },
      {
        $set: { ...question, sourceId: question.id, updatedAt: now },
        $setOnInsert: { _id, createdAt: now },
      },
      { upsert: true },
    );
  }

  for (const item of seed.sheetItems) {
    const existing = await db.collection("sheetitems").findOne({ sheetId: sheetObjectId, sourceId: item.id }, { projection: { _id: 1 } });
    const _id = existing?._id || objectIdFor("sheetitem", item.id);
    await db.collection("sheetitems").updateOne(
      { sheetId: sheetObjectId, sourceId: item.id },
      {
        $set: {
          sourceId: item.id,
          sheetId: sheetObjectId,
          questionId: questionIds.get(item.questionId),
          sectionId: sectionIds.get(item.sectionId),
          subTopicId: subTopicIds.get(item.subTopicId),
          order: item.order,
          displayTitle: item.displayTitle,
          legacyQuestionId: item.legacyQuestionId,
          matchMethod: item.matchMethod,
          updatedAt: now,
        },
        $setOnInsert: { _id, createdAt: now },
      },
      { upsert: true },
    );
  }

  console.log(`Seeded ${seed.sheetItems.length} Striver A2Z sheet items into MongoDB.`);
} finally {
  await client.close();
}
