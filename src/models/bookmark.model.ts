import mongoose, { Schema, type InferSchemaType } from "mongoose";

const bookmarkSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    sheetId: { type: Schema.Types.ObjectId, ref: "Sheet", required: true, index: true },
    questionId: { type: Schema.Types.ObjectId, ref: "Question", required: true, index: true },
  },
  { timestamps: true },
);

bookmarkSchema.index({ userId: 1, sheetId: 1, questionId: 1 }, { unique: true });

export type BookmarkDocument = InferSchemaType<typeof bookmarkSchema>;
export const Bookmark = mongoose.models.Bookmark || mongoose.model("Bookmark", bookmarkSchema);
