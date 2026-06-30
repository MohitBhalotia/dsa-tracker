import mongoose, { Schema, type InferSchemaType } from "mongoose";

const linkSchema = new Schema(
  {
    type: { type: String, required: true },
    platform: { type: String, required: true },
    label: { type: String, required: true },
    url: { type: String, required: true },
    primary: { type: Boolean, default: false },
  },
  { _id: false },
);

const questionSchema = new Schema(
  {
    sourceId: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, index: "text" },
    canonicalTitle: { type: String, required: true },
    slug: { type: String, required: true, index: true },
    canonicalKey: { type: String, required: true, index: true },
    difficulty: { type: String, enum: ["basic", "easy", "medium", "hard", "unknown"], default: "unknown", index: true },
    platform: { type: String, default: "unknown", index: true },
    platformId: { type: String },
    platformSlug: { type: String },
    description: { type: String },
    topics: [{ type: String, index: true }],
    companyTags: [{ type: String, index: true }],
    verified: { type: Boolean, default: false },
    similarQuestionIds: [{ type: String }],
    links: [linkSchema],
    legacy: { type: Schema.Types.Mixed },
    importMeta: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
);

questionSchema.index({ title: "text", canonicalTitle: "text", topics: "text", companyTags: "text" });

export type QuestionDocument = InferSchemaType<typeof questionSchema>;
export const Question = mongoose.models.Question || mongoose.model("Question", questionSchema);
