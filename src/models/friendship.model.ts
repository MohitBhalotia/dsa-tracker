import mongoose, { Schema, type InferSchemaType } from "mongoose";

const friendshipSchema = new Schema(
  {
    requesterId: { type: String, required: true, index: true },
    recipientId: { type: String, required: true, index: true },
    status: { type: String, enum: ["pending", "accepted", "blocked"], default: "pending", index: true },
  },
  { timestamps: true },
);

friendshipSchema.index({ requesterId: 1, recipientId: 1 }, { unique: true });

export type FriendshipDocument = InferSchemaType<typeof friendshipSchema>;
export const Friendship = mongoose.models.Friendship || mongoose.model("Friendship", friendshipSchema);
