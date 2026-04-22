import mongoose, { Schema, Document, Model } from "mongoose";

export interface IWritingSubmission extends Document {
  userId: mongoose.Types.ObjectId;
  originalText: string;
  correctedText: string;
  score: number;
  feedback: {
    grammar: string[];
    style: string[];
  };
  createdAt: Date;
}

const WritingSubmissionSchema = new Schema<IWritingSubmission>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    originalText: { type: String, required: true },
    correctedText: { type: String, required: true },
    score: { type: Number, required: true },
    feedback: {
      grammar: { type: [String], default: [] },
      style: { type: [String], default: [] },
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const WritingSubmission: Model<IWritingSubmission> =
  mongoose.models.WritingSubmission ||
  mongoose.model<IWritingSubmission>("WritingSubmission", WritingSubmissionSchema);
