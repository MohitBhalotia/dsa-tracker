import seedJson from "@/data/striver-a2z.seed.json";
import type { Difficulty, SeedData, SeedQuestion } from "@/types/seed";

export const seed = seedJson as SeedData;

export type QuestionWithPlacement = SeedQuestion & {
  order: number;
  displayTitle: string;
  sectionId: string;
  sectionTitle: string;
  subTopicId: string;
  subTopicTitle: string;
};

export type SheetFilters = {
  query?: string;
  topic?: string;
  difficulty?: Difficulty | "all";
  platform?: string;
  company?: string;
  sort?: "order" | "difficulty" | "title";
};

export function getSheetSummary() {
  return seed.sheet;
}

export function getSections() {
  return seed.sections;
}

export function getQuestionsWithPlacement(filters: SheetFilters = {}) {
  const byQuestion = new Map(seed.questions.map((question) => [question.id, question]));
  const bySection = new Map(seed.sections.map((section) => [section.id, section]));
  const bySubTopic = new Map(seed.subTopics.map((subTopic) => [subTopic.id, subTopic]));

  let rows = seed.sheetItems
    .map((item) => {
      const question = byQuestion.get(item.questionId);
      const section = bySection.get(item.sectionId);
      const subTopic = bySubTopic.get(item.subTopicId);
      if (!question || !section || !subTopic) return null;
      return {
        ...question,
        order: item.order,
        displayTitle: item.displayTitle,
        sectionId: section.id,
        sectionTitle: section.title,
        subTopicId: subTopic.id,
        subTopicTitle: subTopic.title,
      } satisfies QuestionWithPlacement;
    })
    .filter(Boolean) as QuestionWithPlacement[];

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

  if (filters.difficulty && filters.difficulty !== "all") {
    rows = rows.filter((row) => row.difficulty === filters.difficulty);
  }

  if (filters.platform && filters.platform !== "all") {
    rows = rows.filter((row) => row.platform === filters.platform || row.links.some((link) => link.platform === filters.platform));
  }

  if (filters.company && filters.company !== "all") {
    rows = rows.filter((row) => row.companyTags.includes(filters.company ?? ""));
  }

  return rows.sort((a, b) => {
    if (filters.sort === "title") return a.title.localeCompare(b.title);
    if (filters.sort === "difficulty") return a.difficulty.localeCompare(b.difficulty) || a.order - b.order;
    return a.order - b.order;
  });
}

export function getQuestionById(questionId: string) {
  return getQuestionsWithPlacement().find((question) => question.id === questionId || question.slug === questionId);
}

export function getFilterOptions() {
  const rows = getQuestionsWithPlacement();
  return {
    sections: seed.sections,
    difficulties: Array.from(new Set(rows.map((row) => row.difficulty))),
    platforms: Array.from(new Set(rows.flatMap((row) => [row.platform, ...row.links.map((link) => link.platform)]))).filter(Boolean).sort(),
    companies: Array.from(new Set(rows.flatMap((row) => row.companyTags))).sort(),
    topics: Array.from(new Set(rows.flatMap((row) => row.topics))).sort(),
  };
}
