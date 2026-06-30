import mongoose, { Schema, type InferSchemaType } from "mongoose";

const leaderboardEntrySchema = new Schema(
  {
    userId: { type: String, required: true },
    solvedCount: { type: Number, default: 0 },
    revisionCount: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    score: { type: Number, default: 0 },
    rank: { type: Number, required: true },
  },
  { _id: false },
);

const leaderboardSnapshotSchema = new Schema(
  {
    period: { type: String, enum: ["daily", "weekly", "monthly", "all_time"], required: true, index: true },
    periodStart: { type: Date, required: true },
    periodEnd: { type: Date, required: true },
    sheetId: { type: Schema.Types.ObjectId, ref: "Sheet" },
    entries: [leaderboardEntrySchema],
  },
  { timestamps: true },
);

leaderboardSnapshotSchema.index({ period: 1, periodStart: 1, sheetId: 1 });

export type LeaderboardSnapshotDocument = InferSchemaType<typeof leaderboardSnapshotSchema>;
export const LeaderboardSnapshot =
  mongoose.models.LeaderboardSnapshot || mongoose.model("LeaderboardSnapshot", leaderboardSnapshotSchema);
