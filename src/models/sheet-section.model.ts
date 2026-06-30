import mongoose, { Schema, type InferSchemaType } from "mongoose";

const sheetSectionSchema = new Schema(
  {
    sheetId: { type: Schema.Types.ObjectId, ref: "Sheet", required: true, index: true },
    sourceId: { type: String, required: true },
    title: { type: String, required: true },
    slug: { type: String, required: true },
    order: { type: Number, required: true },
  },
  { timestamps: true },
);

sheetSectionSchema.index({ sheetId: 1, slug: 1 }, { unique: true });
sheetSectionSchema.index({ sheetId: 1, order: 1 });

export type SheetSectionDocument = InferSchemaType<typeof sheetSectionSchema>;
export const SheetSection = mongoose.models.SheetSection || mongoose.model("SheetSection", sheetSectionSchema);
