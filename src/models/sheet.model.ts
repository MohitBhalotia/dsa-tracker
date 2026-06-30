import mongoose, { Schema, type InferSchemaType } from "mongoose";

const sheetSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, default: "" },
    source: { type: String, required: true, index: true },
    sourceUrl: { type: String },
    banner: { type: String },
    visibility: { type: String, enum: ["public", "private", "unlisted"], default: "public" },
    ownerId: { type: Schema.Types.ObjectId, ref: "UserProfile" },
    isOfficial: { type: Boolean, default: false },
    version: { type: String, default: "1" },
    tags: [{ type: String }],
    totalQuestions: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export type SheetDocument = InferSchemaType<typeof sheetSchema>;
export const Sheet = mongoose.models.Sheet || mongoose.model("Sheet", sheetSchema);
