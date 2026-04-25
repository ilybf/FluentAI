import mongoose, { Schema, Document, Model } from "mongoose";

export interface IScoreEvent extends Document {
  userId: mongoose.Types.ObjectId;
  type: "writing" | "reading" | "chat" | "vocabulary" | "streak" | "level_up";
  points: number;
  metadata: {
    submissionId?: string;
    details?: string;
    score?: number;
  };
  createdAt: Date;
}

const ScoreEventSchema = new Schema<IScoreEvent>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["writing", "reading", "chat", "vocabulary", "streak", "level_up"],
      required: true,
    },
    points: {
      type: Number,
      required: true,
    },
    metadata: {
      submissionId: { type: String },
      details: { type: String },
      score: { type: Number },
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Compound index for efficient per-user, per-type queries (e.g., daily caps)
ScoreEventSchema.index({ userId: 1, type: 1, createdAt: -1 });

export const ScoreEvent: Model<IScoreEvent> =
  mongoose.models.ScoreEvent ||
  mongoose.model<IScoreEvent>("ScoreEvent", ScoreEventSchema);
