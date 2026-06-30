import mongoose, { Schema, type InferSchemaType } from "mongoose";

const sheetSubTopicSchema = new Schema(
  {
    sheetId: { type: Schema.Types.ObjectId, ref: "Sheet", required: true, index: true },
    sectionId: { type: Schema.Types.ObjectId, ref: "SheetSection", required: true, index: true },
    sourceId: { type: String, required: true },
    title: { type: String, required: true },
    slug: { type: String, required: true },
    order: { type: Number, required: true },
  },
  { timestamps: true },
);

sheetSubTopicSchema.index({ sheetId: 1, sectionId: 1, slug: 1 }, { unique: true });

export type SheetSubTopicDocument = InferSchemaType<typeof sheetSubTopicSchema>;
export const SheetSubTopic = mongoose.models.SheetSubTopic || mongoose.model("SheetSubTopic", sheetSubTopicSchema);
