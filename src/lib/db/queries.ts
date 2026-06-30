import { eachDayOfInterval, format, subDays } from "date-fns";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Bookmark } from "@/models/bookmark.model";
import { ActivityLog } from "@/models/activity-log.model";
import { Question } from "@/models/question.model";
import { Sheet } from "@/models/sheet.model";
import { SheetItem } from "@/models/sheet-item.model";
import "@/models/sheet-section.model";
import "@/models/sheet-sub-topic.model";
import { UserProgress } from "@/models/user-progress.model";
import type { Difficulty, QuestionLink } from "@/types/seed";

export type DbQuestionWithPlacement = {
  id: string;
  objectId: string;
  title: string;
  canonicalTitle: string;
  slug: string;
  difficulty: Difficulty;
  platform: string;
  topics: string[];
  companyTags: string[];
  links: QuestionLink[];
  order: number;
  displayTitle: string;
  sectionId: string;
  sectionTitle: string;
  subTopicId: string;
  subTopicTitle: string;
  solved: boolean;
  bookmarked: boolean;
  notes: string;
  revisionCount: number;
  nextRevisionAt: string | null;
  lastSolvedAt: string | null;
  confidence?: number;
  attemptsCount: number;
  timeSpentMinutes: number;
};

export type SheetFilters = {
  query?: string;
  topic?: string;
  difficulty?: Difficulty | "all";
  platform?: string;
  company?: string;
  solved?: "all" | "solved" | "unsolved";
  bookmarked?: "all" | "bookmarked";
  sort?: "order" | "difficulty" | "title" | "recently-solved";
};

export type SheetSummaryForUser = Awaited<ReturnType<typeof getSheetSummaryForUser>>;
export type DashboardAnalyticsForUser = Awaited<ReturnType<typeof getDashboardAnalyticsForUser>>;
export type FilterOptionsForUser = Awaited<ReturnType<typeof getFilterOptionsForUser>>;

function serializeDate(value: unknown) {
  return value instanceof Date ? value.toISOString() : value ? new Date(String(value)).toISOString() : null;
}

function normalizePlatform(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function rowHasPlatform(row: { platform: string; links: QuestionLink[] }, platform: "leetcode" | "gfg") {
  const aliases =
    platform === "leetcode"
      ? new Set(["leetcode", "leet"])
      : new Set(["gfg", "geeksforgeeks", "geeksforgeekspractice"]);
  const candidates = [row.platform, ...row.links.map((link) => link.platform), ...row.links.map((link) => link.label)];
  return candidates.some((candidate) => aliases.has(normalizePlatform(candidate)));
}

function getCurrentStreakFromDates(dates: Set<string>) {
  let currentStreak = 0;
  for (let i = 0; i < 365; i += 1) {
    const key = format(subDays(new Date(), i), "yyyy-MM-dd");
    if (!dates.has(key)) break;
    currentStreak += 1;
  }
  return currentStreak;
}

export async function getPrimarySheet() {
  await connectToDatabase();
  const sheet = await Sheet.findOne({ slug: "strivers-a2z-dsa-sheet" }).lean();
  if (!sheet) {
    throw new Error("Striver A2Z sheet is not seeded. Run `npm run seed:db`.");
  }
  return {
    objectId: sheet._id.toString(),
    title: sheet.title,
    slug: sheet.slug,
    description: sheet.description,
    source: sheet.source,
    sourceUrl: sheet.sourceUrl,
    banner: sheet.banner,
    visibility: sheet.visibility,
    tags: sheet.tags || [],
    isOfficial: sheet.isOfficial,
    version: sheet.version,
    totalQuestions: sheet.totalQuestions,
  };
}

export async function getQuestionsForUser(userId: string, filters: SheetFilters = {}) {
  await connectToDatabase();
  const sheet = await Sheet.findOne({ slug: "strivers-a2z-dsa-sheet" }).lean();
  if (!sheet) throw new Error("Striver A2Z sheet is not seeded. Run `npm run seed:db`.");

  const items = await SheetItem.find({ sheetId: sheet._id })
    .sort({ order: 1 })
    .populate("questionId")
    .populate("sectionId")
    .populate("subTopicId")
    .lean();

  const questionIds = items.map((item) => (item.questionId as { _id: unknown })._id);
  const [progressRows, bookmarkRows] = await Promise.all([
    UserProgress.find({ userId, sheetId: sheet._id, questionId: { $in: questionIds } }).lean(),
    Bookmark.find({ userId, sheetId: sheet._id, questionId: { $in: questionIds } }).lean(),
  ]);

  const progressByQuestion = new Map(progressRows.map((row) => [row.questionId.toString(), row]));
  const bookmarks = new Set(bookmarkRows.map((row) => row.questionId.toString()));

  let rows = items.map((item) => {
    const question = item.questionId as unknown as {
      _id: { toString(): string };
      sourceId: string;
      title: string;
      canonicalTitle: string;
      slug: string;
      difficulty: Difficulty;
      platform: string;
      topics?: string[];
      companyTags?: string[];
      links?: QuestionLink[];
    };
    const section = item.sectionId as unknown as { sourceId: string; title: string };
    const subTopic = item.subTopicId as unknown as { sourceId: string; title: string };
    const progress = progressByQuestion.get(question._id.toString());
    return {
      id: question.sourceId,
      objectId: question._id.toString(),
      title: question.title,
      canonicalTitle: question.canonicalTitle,
      slug: question.slug,
      difficulty: question.difficulty,
      platform: question.platform,
      topics: question.topics || [],
      companyTags: question.companyTags || [],
      links: question.links || [],
      order: item.order,
      displayTitle: item.displayTitle,
      sectionId: section.sourceId,
      sectionTitle: section.title,
      subTopicId: subTopic.sourceId,
      subTopicTitle: subTopic.title,
      solved: progress?.status === "solved",
      bookmarked: bookmarks.has(question._id.toString()),
      notes: progress?.notes || "",
      revisionCount: progress?.revisionCount || 0,
      nextRevisionAt: serializeDate(progress?.nextRevisionAt),
      lastSolvedAt: serializeDate(progress?.lastSolvedAt),
      confidence: progress?.confidence,
      attemptsCount: progress?.attemptsCount || 0,
      timeSpentMinutes: progress?.timeSpentMinutes || 0,
    } satisfies DbQuestionWithPlacement;
  });

  if (filters.query) {
    const needle = filters.query.toLowerCase();
    rows = rows.filter((row) =>
      [row.title, row.canonicalTitle, row.sectionTitle, row.subTopicTitle, ...row.topics, ...row.companyTags]
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }

  if (filters.topic && filters.topic !== "all") {
    rows = rows.filter((row) => row.sectionId === filters.topic || row.topics.includes(filters.topic ?? ""));
  }
  if (filters.difficulty && filters.difficulty !== "all") rows = rows.filter((row) => row.difficulty === filters.difficulty);
  if (filters.platform && filters.platform !== "all") {
    rows = rows.filter((row) => row.platform === filters.platform || row.links.some((link) => link.platform === filters.platform));
  }
  if (filters.company && filters.company !== "all") rows = rows.filter((row) => row.companyTags.includes(filters.company ?? ""));
  if (filters.solved === "solved") rows = rows.filter((row) => row.solved);
  if (filters.solved === "unsolved") rows = rows.filter((row) => !row.solved);
  if (filters.bookmarked === "bookmarked") rows = rows.filter((row) => row.bookmarked);

  return rows.sort((a, b) => {
    if (filters.sort === "title") return a.title.localeCompare(b.title);
    if (filters.sort === "difficulty") return a.difficulty.localeCompare(b.difficulty) || a.order - b.order;
    if (filters.sort === "recently-solved") return (b.lastSolvedAt || "").localeCompare(a.lastSolvedAt || "");
    return a.order - b.order;
  });
}

type PopulatedSheetItem = {
  order: number;
  displayTitle: string;
  sheetId: { _id: unknown };
  questionId: {
    _id: { toString(): string };
    sourceId: string;
    title: string;
    canonicalTitle: string;
    slug: string;
    difficulty: Difficulty;
    platform: string;
    topics?: string[];
    companyTags?: string[];
    links?: QuestionLink[];
  };
  sectionId: { sourceId: string; title: string };
  subTopicId: { sourceId: string; title: string };
};

async function getQuestionRowForUser(userId: string, item: PopulatedSheetItem) {
  const leanItem = item as unknown as {
    order: number;
    displayTitle: string;
    sheetId: { _id: unknown };
    questionId: {
      _id: { toString(): string };
      sourceId: string;
      title: string;
      canonicalTitle: string;
      slug: string;
      difficulty: Difficulty;
      platform: string;
      topics?: string[];
      companyTags?: string[];
      links?: QuestionLink[];
    };
    sectionId: { sourceId: string; title: string };
    subTopicId: { sourceId: string; title: string };
  };
  const question = leanItem.questionId;
  const [progress, bookmark] = await Promise.all([
    UserProgress.findOne({ userId, sheetId: leanItem.sheetId._id, questionId: question._id }).lean(),
    Bookmark.findOne({ userId, sheetId: leanItem.sheetId._id, questionId: question._id }).lean(),
  ]);

  return {
    id: question.sourceId,
    objectId: question._id.toString(),
    title: question.title,
    canonicalTitle: question.canonicalTitle,
    slug: question.slug,
    difficulty: question.difficulty,
    platform: question.platform,
    topics: question.topics || [],
    companyTags: question.companyTags || [],
    links: question.links || [],
    order: leanItem.order,
    displayTitle: leanItem.displayTitle,
    sectionId: leanItem.sectionId.sourceId,
    sectionTitle: leanItem.sectionId.title,
    subTopicId: leanItem.subTopicId.sourceId,
    subTopicTitle: leanItem.subTopicId.title,
    solved: progress?.status === "solved",
    bookmarked: Boolean(bookmark),
    notes: progress?.notes || "",
    revisionCount: progress?.revisionCount || 0,
    nextRevisionAt: serializeDate(progress?.nextRevisionAt),
    lastSolvedAt: serializeDate(progress?.lastSolvedAt),
    confidence: progress?.confidence,
    attemptsCount: progress?.attemptsCount || 0,
    timeSpentMinutes: progress?.timeSpentMinutes || 0,
  } satisfies DbQuestionWithPlacement;
}

export async function getQuestionForUser(userId: string, questionId: string) {
  await connectToDatabase();
  const sheet = await Sheet.findOne({ slug: "strivers-a2z-dsa-sheet" }).lean();
  if (!sheet) throw new Error("Striver A2Z sheet is not seeded. Run `npm run seed:db`.");
  const question = await Question.findOne({ $or: [{ sourceId: questionId }, { slug: questionId }] }).lean();
  if (!question) return undefined;

  const item = await SheetItem.findOne({ sheetId: sheet._id, questionId: question._id })
    .populate("questionId")
    .populate("sectionId")
    .populate("subTopicId")
    .lean();

  if (!item || !item.questionId) return undefined;
  return getQuestionRowForUser(userId, item as unknown as PopulatedSheetItem);
}

export async function getFilterOptionsForUser(_userId: string) {
  void _userId;
  await connectToDatabase();
  const sheet = await Sheet.findOne({ slug: "strivers-a2z-dsa-sheet" }).lean();
  if (!sheet) throw new Error("Striver A2Z sheet is not seeded. Run `npm run seed:db`.");

  const items = await SheetItem.find({ sheetId: sheet._id })
    .populate("questionId", "difficulty platform links topics companyTags")
    .populate("sectionId", "sourceId title")
    .sort({ order: 1 })
    .lean();

  const sections = Array.from(
    new Map(
      items.map((item) => {
        const section = item.sectionId as unknown as { sourceId: string; title: string };
        return [section.sourceId, { id: section.sourceId, title: section.title }];
      }),
    ).values(),
  );
  const questions = items.map((item) => item.questionId as unknown as {
    difficulty: Difficulty;
    platform: string;
    topics?: string[];
    companyTags?: string[];
    links?: QuestionLink[];
  });

  const primarySheet = {
    objectId: sheet._id.toString(),
    title: sheet.title,
    slug: sheet.slug,
    description: sheet.description,
    source: sheet.source,
    sourceUrl: sheet.sourceUrl,
    banner: sheet.banner,
    visibility: sheet.visibility,
    tags: sheet.tags || [],
    isOfficial: sheet.isOfficial,
    version: sheet.version,
    totalQuestions: sheet.totalQuestions,
  };

  return {
    sheet: primarySheet,
    sections,
    difficulties: Array.from(new Set(questions.map((question) => question.difficulty))).sort(),
    platforms: Array.from(new Set(questions.flatMap((question) => [question.platform, ...(question.links || []).map((link) => link.platform)]))).filter(Boolean).sort(),
    companies: Array.from(new Set(questions.flatMap((question) => question.companyTags || []))).sort(),
    topics: Array.from(new Set(questions.flatMap((question) => question.topics || []))).sort(),
  };
}

export async function getSheetSummaryForUser(userId: string) {
  await connectToDatabase();
  const sheet = await Sheet.findOne({ slug: "strivers-a2z-dsa-sheet" }).lean();
  if (!sheet) throw new Error("Striver A2Z sheet is not seeded. Run `npm run seed:db`.");
  const solvedCount = await UserProgress.countDocuments({ userId, sheetId: sheet._id, status: "solved" });
  const totalQuestions = sheet.totalQuestions || await SheetItem.countDocuments({ sheetId: sheet._id });
  return {
    objectId: sheet._id.toString(),
    title: sheet.title,
    slug: sheet.slug,
    description: sheet.description,
    source: sheet.source,
    sourceUrl: sheet.sourceUrl,
    banner: sheet.banner,
    visibility: sheet.visibility,
    tags: sheet.tags || [],
    isOfficial: sheet.isOfficial,
    version: sheet.version,
    totalQuestions,
    solvedCount,
    completion: totalQuestions ? Math.round((solvedCount / totalQuestions) * 100) : 0,
  };
}

export async function getDashboardAnalyticsForUser(userId: string) {
  await connectToDatabase();
  const sheet = await Sheet.findOne({ slug: "strivers-a2z-dsa-sheet" }).lean();
  if (!sheet) throw new Error("Striver A2Z sheet is not seeded. Run `npm run seed:db`.");

  const [items, progressRows] = await Promise.all([
    SheetItem.find({ sheetId: sheet._id })
      .populate("questionId", "difficulty platform links")
      .populate("sectionId", "sourceId title")
      .lean(),
    UserProgress.find({ userId, sheetId: sheet._id }).lean(),
  ]);

  const progressByQuestionId = new Map(progressRows.map((row) => [row.questionId.toString(), row]));
  const total = sheet.totalQuestions || items.length;
  const solvedCount = progressRows.filter((row) => row.status === "solved").length;
  const remaining = total - solvedCount;
  const sectionMap = new Map<string, { topic: string; total: number; solved: number; percent: number }>();
  const rows = items.map((item) => {
    const question = item.questionId as unknown as {
      _id: { toString(): string };
      difficulty: Difficulty;
      platform: string;
      links?: QuestionLink[];
    };
    const section = item.sectionId as unknown as { sourceId: string; title: string };
    const progress = progressByQuestionId.get(question._id.toString());
    return {
      objectId: question._id.toString(),
      difficulty: question.difficulty,
      platform: question.platform,
      links: question.links || [],
      sectionId: section.sourceId,
      sectionTitle: section.title,
      solved: progress?.status === "solved",
      nextRevisionAt: serializeDate(progress?.nextRevisionAt),
    };
  });

  for (const row of rows) {
    const current = sectionMap.get(row.sectionId) || { topic: row.sectionTitle, total: 0, solved: 0, percent: 0 };
    current.total += 1;
    if (row.solved) current.solved += 1;
    current.percent = current.total ? Math.round((current.solved / current.total) * 100) : 0;
    sectionMap.set(row.sectionId, current);
  }

  const difficultyOrder: Difficulty[] = ["basic", "easy", "medium", "hard", "unknown"];
  const byDifficulty = difficultyOrder.map((difficulty) => ({
    difficulty,
    total: rows.filter((row) => row.difficulty === difficulty).length,
    solved: rows.filter((row) => row.difficulty === difficulty && row.solved).length,
  }));

  const since = subDays(new Date(), 364);
  const activity = await ActivityLog.find({ userId, occurredAt: { $gte: since } }).lean();
  const activityByDate = new Map<string, number>();
  for (const event of activity) activityByDate.set(event.localDate, (activityByDate.get(event.localDate) || 0) + 1);

  const heatmap = eachDayOfInterval({ start: since, end: new Date() }).map((date) => {
    const key = format(date, "yyyy-MM-dd");
    return { date: key, count: activityByDate.get(key) || 0 };
  });

  const solvedEvents = activity.filter((event) => event.type === "solved");
  const solvedDates = new Set(solvedEvents.map((event) => event.localDate));
  const rowsByQuestionId = new Map(rows.map((row) => [row.objectId, row]));
  const leetcodeSolvedDates = new Set<string>();
  const gfgSolvedDates = new Set<string>();

  for (const event of solvedEvents) {
    const row = rowsByQuestionId.get(event.questionId?.toString() || "");
    if (!row) continue;
    if (rowHasPlatform(row, "leetcode")) leetcodeSolvedDates.add(event.localDate);
    if (rowHasPlatform(row, "gfg")) gfgSolvedDates.add(event.localDate);
  }

  const currentStreak = getCurrentStreakFromDates(solvedDates);

  const weekly = Array.from({ length: 8 }, (_, index) => {
    const start = subDays(new Date(), (7 - index) * 7);
    const end = subDays(start, -6);
    const solvedEvents = activity.filter((event) => event.type === "solved" && event.occurredAt >= start && event.occurredAt <= end).length;
    const revisions = activity.filter((event) => event.type === "revision_completed" && event.occurredAt >= start && event.occurredAt <= end).length;
    return { week: `W${index + 1}`, solved: solvedEvents, revisions };
  });

  return {
    total,
    solvedCount,
    remaining,
    completion: total ? Math.round((solvedCount / total) * 100) : 0,
    currentStreak,
    longestStreak: currentStreak,
    platformStreaks: {
      leetcode: getCurrentStreakFromDates(leetcodeSolvedDates),
      gfg: getCurrentStreakFromDates(gfgSolvedDates),
    },
    weeklySolvedCount: weekly.at(-1)?.solved ?? 0,
    averagePerDay: solvedCount ? Number((solvedCount / 30).toFixed(1)) : 0,
    revisionDue: rows.filter((row) => row.nextRevisionAt && new Date(row.nextRevisionAt) <= new Date()).length,
    revisionUpcoming: rows.filter((row) => row.nextRevisionAt && new Date(row.nextRevisionAt) > new Date()).length,
    bySection: Array.from(sectionMap.values()),
    byDifficulty,
    solvedVsUnsolved: [
      { name: "Solved", value: solvedCount },
      { name: "Unsolved", value: remaining },
    ],
    weekly,
    heatmap,
    sheetComparison: [{ sheet: "Striver A2Z", solved: solvedCount, total }],
  };
}

export async function getAllSheetsForUser(userId: string) {
  return [await getSheetSummaryForUser(userId)];
}

export async function getRevisionQueueForUser(userId: string) {
  await connectToDatabase();
  const sheet = await Sheet.findOne({ slug: "strivers-a2z-dsa-sheet" }).lean();
  if (!sheet) throw new Error("Striver A2Z sheet is not seeded. Run `npm run seed:db`.");

  const progressRows = await UserProgress.find({
    userId,
    sheetId: sheet._id,
    $or: [{ status: "solved" }, { nextRevisionAt: { $ne: null } }],
  })
    .sort({ nextRevisionAt: 1 })
    .limit(24)
    .lean();

  const questionIds = progressRows.map((row) => row.questionId);
  const items = await SheetItem.find({ sheetId: sheet._id, questionId: { $in: questionIds } })
    .populate("questionId")
    .populate("sectionId")
    .populate("subTopicId")
    .lean();
  const itemByQuestionId = new Map(items.map((item) => [String((item.questionId as { _id: unknown })._id), item]));

  const rows = await Promise.all(
    progressRows
      .map((progress) => itemByQuestionId.get(progress.questionId.toString()))
      .filter(Boolean)
      .map((item) => getQuestionRowForUser(userId, item as unknown as PopulatedSheetItem)),
  );
  return rows.sort((a, b) => (a.nextRevisionAt || "").localeCompare(b.nextRevisionAt || ""));
}
