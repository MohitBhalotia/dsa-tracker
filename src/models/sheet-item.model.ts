import mongoose, { Schema, type InferSchemaType } from "mongoose";

const sheetItemSchema = new Schema(
  {
    sourceId: { type: String, required: true },
    sheetId: { type: Schema.Types.ObjectId, ref: "Sheet", required: true, index: true },
    questionId: { type: Schema.Types.ObjectId, ref: "Question", required: true, index: true },
    sectionId: { type: Schema.Types.ObjectId, ref: "SheetSection", required: true, index: true },
    subTopicId: { type: Schema.Types.ObjectId, ref: "SheetSubTopic", required: true, index: true },
    order: { type: Number, required: true },
    displayTitle: { type: String, required: true },
    legacyQuestionId: { type: String },
    matchMethod: { type: String, enum: ["title", "order-topic-fallback", "unmatched"], required: true },
  },
  { timestamps: true },
);

sheetItemSchema.index({ sheetId: 1, questionId: 1 }, { unique: true });
sheetItemSchema.index({ sheetId: 1, sectionId: 1, subTopicId: 1, order: 1 });

export type SheetItemDocument = InferSchemaType<typeof sheetItemSchema>;
export const SheetItem = mongoose.models.SheetItem || mongoose.model("SheetItem", sheetItemSchema);
