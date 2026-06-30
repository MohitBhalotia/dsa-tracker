import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const oldPath = path.join(root, "data.json");
const newPath = path.join(root, "new-data.json");
const outPath = path.join(root, "src", "data", "striver-a2z.seed.json");

const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf8"));

const normalizeText = (value = "") =>
  String(value)
    .replace(/â€™|â€˜/g, "'")
    .replace(/â€œ|â€�/g, '"')
    .replace(/â€“|â€”/g, "-")
    .replace(/Â/g, "")
    .replace(/\s+/g, " ")
    .trim();

const slugify = (value = "") =>
  normalizeText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const titleKey = (value = "") =>
  normalizeText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const difficultyMap = {
  basic: "basic",
  easy: "easy",
  medium: "medium",
  hard: "hard",
};

const asDifficulty = (value) => difficultyMap[String(value || "").toLowerCase()] || "unknown";

const platformFromUrl = (url = "") => {
  if (url.includes("leetcode.com")) return "leetcode";
  if (url.includes("geeksforgeeks.org")) return "gfg";
  if (url.includes("takeuforward.org")) return "takeuforward";
  if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube";
  if (url.includes("hackerrank.com")) return "hackerrank";
  if (url.includes("interviewbit.com")) return "interviewbit";
  if (url.includes("spoj.com")) return "spoj";
  return "other";
};

const link = (type, url, label) => {
  const cleanUrl = normalizeText(url);
  if (!cleanUrl || cleanUrl === "#") return null;
  return { type, platform: platformFromUrl(cleanUrl), label, url: cleanUrl, primary: true };
};

const flattenOld = (source) => {
  const records = [];
  source.content.forEach((section, sectionIndex) => {
    section.categoryList.forEach((category, categoryIndex) => {
      category.questionList.forEach((question) => {
        records.push({
          sectionTitle: normalizeText(section.contentHeading),
          sectionSlug: slugify(section.contentPath || section.contentHeading),
          sectionOrder: sectionIndex + 1,
          subTopicTitle: normalizeText(category.categoryName),
          subTopicSlug: slugify(category.categoryName),
          subTopicOrder: categoryIndex + 1,
          order: records.length + 1,
          title: normalizeText(question.questionHeading),
          legacyQuestionId: question.questionId,
          links: [
            link("article", question.questionLink, "TakeUForward"),
            link("practice", question.gfgLink, "GeeksforGeeks"),
            link("practice", question.leetCodeLink, "LeetCode"),
            link("video", question.youTubeLink, "YouTube"),
          ].filter(Boolean),
        });
      });
    });
  });
  return records;
};

const flattenNew = (source) =>
  source.data.mappings.map((item, index) => ({
    index,
    mappingId: item._id,
    title: normalizeText(item.title || item.questionId?.name || ""),
    titleKey: titleKey(item.title || item.questionId?.name || ""),
    topic: normalizeText(item.topic),
    subTopic: normalizeText(item.subTopic),
    resource: normalizeText(item.resource || ""),
    hotness: item.hotness ?? null,
    rank: item.rank ?? null,
    question: item.questionId || {},
  }));

const source = readJson(oldPath);
const enrichment = readJson(newPath);
const oldQuestions = flattenOld(source);
const newMappings = flattenNew(enrichment);
const warnings = [];

const byTitle = new Map();
for (const mapping of newMappings) {
  if (!mapping.titleKey) continue;
  const existing = byTitle.get(mapping.titleKey);
  if (existing) {
    warnings.push({ type: "duplicate-new-title", title: mapping.title, mappingIds: [existing.mappingId, mapping.mappingId] });
  } else {
    byTitle.set(mapping.titleKey, mapping);
  }
}

const usedMappings = new Set();
const findFallback = (oldRecord) => {
  const candidates = newMappings.filter((mapping) => {
    if (usedMappings.has(mapping.mappingId)) return false;
    const sameTopic = titleKey(mapping.topic).includes(titleKey(oldRecord.sectionTitle).split(" ")[0] || "");
    const sameSubTopic = titleKey(mapping.subTopic) === titleKey(oldRecord.subTopicTitle);
    return sameSubTopic || sameTopic;
  });
  return candidates[0] || null;
};

const sections = [];
const subTopics = [];
const questions = [];
const sheetItems = [];
const sectionMap = new Map();
const subTopicMap = new Map();

for (const oldRecord of oldQuestions) {
  const exact = byTitle.get(titleKey(oldRecord.title));
  const fallback = exact ? null : findFallback(oldRecord);
  const mapping = exact || fallback;
  const matchMethod = exact ? "title" : fallback ? "order-topic-fallback" : "unmatched";
  if (mapping) usedMappings.add(mapping.mappingId);

  const sectionKey = `${oldRecord.sectionOrder}:${oldRecord.sectionSlug}`;
  if (!sectionMap.has(sectionKey)) {
    const section = {
      id: `sec-${oldRecord.sectionOrder}`,
      title: oldRecord.sectionTitle,
      slug: oldRecord.sectionSlug,
      order: oldRecord.sectionOrder,
    };
    sectionMap.set(sectionKey, section.id);
    sections.push(section);
  }

  const subTopicKey = `${sectionMap.get(sectionKey)}:${oldRecord.subTopicOrder}:${oldRecord.subTopicSlug}`;
  if (!subTopicMap.has(subTopicKey)) {
    const subTopic = {
      id: `sub-${sectionMap.get(sectionKey)}-${oldRecord.subTopicOrder}`,
      sectionId: sectionMap.get(sectionKey),
      title: oldRecord.subTopicTitle,
      slug: oldRecord.subTopicSlug,
      order: oldRecord.subTopicOrder,
    };
    subTopicMap.set(subTopicKey, subTopic.id);
    subTopics.push(subTopic);
  }

  const q = mapping?.question || {};
  const canonicalTitle = normalizeText(q.name || oldRecord.title);
  const questionId = `q-${slugify(oldRecord.legacyQuestionId || canonicalTitle)}`;
  const canonicalUrl = normalizeText(q.problemUrl || "");
  const links = [...oldRecord.links];
  if (canonicalUrl && canonicalUrl !== "#" && !links.some((item) => item.url.replace(/\/$/, "") === canonicalUrl.replace(/\/$/, ""))) {
    links.push({
      type: "canonical",
      platform: platformFromUrl(canonicalUrl),
      label: "Canonical",
      url: canonicalUrl,
      primary: false,
    });
  }
  if (mapping?.resource && !links.some((item) => item.url === mapping.resource)) {
    links.push({ type: "video", platform: platformFromUrl(mapping.resource), label: "Resource", url: mapping.resource, primary: false });
  }

  questions.push({
    id: questionId,
    title: oldRecord.title,
    canonicalTitle,
    slug: slugify(canonicalTitle || oldRecord.title),
    canonicalKey: `${q.platform || "source"}:${q.id || q.slug || oldRecord.legacyQuestionId}`,
    difficulty: asDifficulty(q.difficulty),
    platform: q.platform || platformFromUrl(canonicalUrl) || "unknown",
    platformId: q.id || null,
    platformSlug: q.slug || null,
    description: null,
    topics: Array.from(new Set((q.topics || []).map(normalizeText).filter(Boolean))),
    companyTags: Array.from(new Set((q.companyTags || []).map((tag) => normalizeText(typeof tag === "string" ? tag : tag.name || tag.company || "")).filter(Boolean))),
    verified: Boolean(q.verified),
    similarQuestionIds: q.similarQuestions || [],
    links,
    legacy: {
      dataJsonQuestionId: oldRecord.legacyQuestionId,
      newDataMappingId: mapping?.mappingId || null,
      newDataQuestionId: q._id || null,
    },
    importMeta: {
      matchMethod,
      hotness: mapping?.hotness ?? null,
      rank: mapping?.rank ?? null,
    },
  });

  sheetItems.push({
    id: `item-${oldRecord.order}`,
    sheetId: "striver-a2z",
    questionId,
    sectionId: sectionMap.get(sectionKey),
    subTopicId: subTopicMap.get(subTopicKey),
    order: oldRecord.order,
    displayTitle: oldRecord.title,
    legacyQuestionId: oldRecord.legacyQuestionId,
    matchMethod,
  });

  if (matchMethod === "unmatched") {
    warnings.push({ type: "unmatched-question", title: oldRecord.title, legacyQuestionId: oldRecord.legacyQuestionId });
  }
}

const seed = {
  generatedAt: new Date().toISOString(),
  sourceFiles: ["data.json", "new-data.json"],
  sheet: {
    id: "striver-a2z",
    title: normalizeText(enrichment.data.sheet.name || "Striver A2Z DSA Sheet"),
    slug: enrichment.data.sheet.slug || "striver-a2z-dsa-sheet",
    description: normalizeText(enrichment.data.sheet.description || ""),
    source: "striver",
    sourceUrl: enrichment.data.sheet.link,
    banner: enrichment.data.sheet.banner,
    visibility: "public",
    tags: enrichment.data.sheet.tag || ["dsa"],
    isOfficial: true,
    version: "2026-06-30",
    totalQuestions: sheetItems.length,
  },
  sections,
  subTopics,
  questions,
  sheetItems,
  importWarnings: warnings,
};

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, `${JSON.stringify(seed, null, 2)}\n`);
console.log(`Generated ${outPath}`);
console.log(`${seed.questions.length} questions, ${warnings.length} warnings`);
