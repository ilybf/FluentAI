import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  displayName: string;
  nativeLanguage: string;
  level: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  totalScore: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false, // Prevents accidental leakage in API responses
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    nativeLanguage: {
      type: String,
      default: "Spanish", // Defaulting for the platform, can be customized
    },
    level: {
      type: String,
      enum: ["A1", "A2", "B1", "B2", "C1", "C2"],
      default: "B1",
    },
    totalScore: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent re-compilation of the model if it already exists
export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
