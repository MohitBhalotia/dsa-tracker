import mongoose, { Schema, type InferSchemaType } from "mongoose";

const revisionSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    sheetId: { type: Schema.Types.ObjectId, ref: "Sheet", required: true, index: true },
    questionId: { type: Schema.Types.ObjectId, ref: "Question", required: true, index: true },
    scheduledFor: { type: Date, required: true, index: true },
    completedAt: { type: Date },
    status: { type: String, enum: ["upcoming", "due", "overdue", "completed", "skipped"], default: "upcoming", index: true },
    stage: { type: Number, default: 0 },
    confidenceBefore: { type: Number, min: 1, max: 5 },
    confidenceAfter: { type: Number, min: 1, max: 5 },
    notes: { type: String },
  },
  { timestamps: true },
);

revisionSchema.index({ userId: 1, scheduledFor: 1, status: 1 });

export type RevisionDocument = InferSchemaType<typeof revisionSchema>;
export const Revision = mongoose.models.Revision || mongoose.model("Revision", revisionSchema);
