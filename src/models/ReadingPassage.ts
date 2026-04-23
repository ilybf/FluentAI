import mongoose, { Schema, Document, Model } from "mongoose";

export interface IQuestion {
  text: string;
  options: string[];
  correctIndex: number;
}

export interface IReadingPassage extends Document {
  title: string;
  content: string;
  level: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  questions: IQuestion[];
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>({
  text: { type: String, required: true },
  options: { type: [String], required: true },
  correctIndex: { type: Number, required: true },
}, { _id: false }); // Disable auto _id on subdocuments

const ReadingPassageSchema = new Schema<IReadingPassage>(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    level: {
      type: String,
      enum: ["A1", "A2", "B1", "B2", "C1", "C2"],
      required: true,
      index: true, // Index for efficient level-based queries
    },
    questions: { type: [QuestionSchema], default: [] },
  },
  {
    timestamps: true,
  }
);

export const ReadingPassage: Model<IReadingPassage> =
  mongoose.models.ReadingPassage ||
  mongoose.model<IReadingPassage>("ReadingPassage", ReadingPassageSchema);
