export type Difficulty = "basic" | "easy" | "medium" | "hard" | "unknown";

export type QuestionLink = {
  type: "article" | "practice" | "video" | "canonical" | "editorial";
  platform: string;
  label: string;
  url: string;
  primary: boolean;
};

export type SeedQuestion = {
  id: string;
  title: string;
  canonicalTitle: string;
  slug: string;
  canonicalKey: string;
  difficulty: Difficulty;
  platform: string;
  platformId: string | null;
  platformSlug: string | null;
  description: string | null;
  topics: string[];
  companyTags: string[];
  verified: boolean;
  similarQuestionIds: string[];
  links: QuestionLink[];
  legacy: {
    dataJsonQuestionId: string;
    newDataMappingId: string | null;
    newDataQuestionId: string | null;
  };
  importMeta: {
    matchMethod: "title" | "order-topic-fallback" | "unmatched";
    hotness: number | null;
    rank: number | null;
  };
};

export type SeedSection = {
  id: string;
  title: string;
  slug: string;
  order: number;
};

export type SeedSubTopic = {
  id: string;
  sectionId: string;
  title: string;
  slug: string;
  order: number;
};

export type SeedSheetItem = {
  id: string;
  sheetId: string;
  questionId: string;
  sectionId: string;
  subTopicId: string;
  order: number;
  displayTitle: string;
  legacyQuestionId: string;
  matchMethod: "title" | "order-topic-fallback" | "unmatched";
};

export type SeedData = {
  generatedAt: string;
  sourceFiles: string[];
  sheet: {
    id: string;
    title: string;
    slug: string;
    description: string;
    source: string;
    sourceUrl: string;
    banner?: string;
    visibility: "public" | "private" | "unlisted";
    tags: string[];
    isOfficial: boolean;
    version: string;
    totalQuestions: number;
  };
  sections: SeedSection[];
  subTopics: SeedSubTopic[];
  questions: SeedQuestion[];
  sheetItems: SeedSheetItem[];
  importWarnings: Array<Record<string, unknown>>;
};
