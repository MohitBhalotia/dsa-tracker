import mongoose, { Schema, type InferSchemaType } from "mongoose";

const solutionLinkSchema = new Schema(
  {
    label: { type: String, required: true },
    url: { type: String, required: true },
    type: { type: String, enum: ["github", "gist", "notion", "other"], default: "other" },
  },
  { _id: false },
);

const userProgressSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    sheetId: { type: Schema.Types.ObjectId, ref: "Sheet", required: true, index: true },
    questionId: { type: Schema.Types.ObjectId, ref: "Question", required: true, index: true },
    status: { type: String, enum: ["unsolved", "solved"], default: "unsolved", index: true },
    solvedAt: { type: Date },
    lastSolvedAt: { type: Date },
    attemptsCount: { type: Number, default: 0 },
    revisionCount: { type: Number, default: 0 },
    confidence: { type: Number, min: 1, max: 5 },
    timeSpentMinutes: { type: Number, default: 0 },
    notes: { type: String, default: "" },
    personalSolutionLinks: [solutionLinkSchema],
    revisionStage: { type: Number, default: 0 },
    nextRevisionAt: { type: Date },
    lastReviewedAt: { type: Date },
  },
  { timestamps: true },
);

userProgressSchema.index({ userId: 1, sheetId: 1, questionId: 1 }, { unique: true });

export type UserProgressDocument = InferSchemaType<typeof userProgressSchema>;
export const UserProgress = mongoose.models.UserProgress || mongoose.model("UserProgress", userProgressSchema);
