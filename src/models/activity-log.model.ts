import mongoose, { Schema, type InferSchemaType } from "mongoose";

const activityLogSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    sheetId: { type: Schema.Types.ObjectId, ref: "Sheet", index: true },
    questionId: { type: Schema.Types.ObjectId, ref: "Question", index: true },
    type: {
      type: String,
      enum: ["solved", "unsolved", "revision_completed", "note_updated", "bookmark_added", "bookmark_removed"],
      required: true,
      index: true,
    },
    occurredAt: { type: Date, default: Date.now, index: true },
    localDate: { type: String, required: true, index: true },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
);

activityLogSchema.index({ userId: 1, localDate: 1, type: 1 });

export type ActivityLogDocument = InferSchemaType<typeof activityLogSchema>;
export const ActivityLog = mongoose.models.ActivityLog || mongoose.model("ActivityLog", activityLogSchema);
