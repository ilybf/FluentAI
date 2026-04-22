import mongoose, { Schema, Document, Model } from "mongoose";

export interface IVocabularyEntry extends Document {
  userId: mongoose.Types.ObjectId;
  word: string;
  contextSentence: string;
  translatedDefinition: string;
  createdAt: Date;
}

const VocabularyEntrySchema = new Schema<IVocabularyEntry>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    word: { type: String, required: true, trim: true },
    contextSentence: { type: String, required: true },
    translatedDefinition: { type: String, required: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const VocabularyEntry: Model<IVocabularyEntry> =
  mongoose.models.VocabularyEntry ||
  mongoose.model<IVocabularyEntry>("VocabularyEntry", VocabularyEntrySchema);
