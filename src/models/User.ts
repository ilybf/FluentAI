import mongoose, { Schema, Document, Model } from "mongoose";

export interface IStreak {
  current: number;
  longest: number;
  lastActiveDate: string; // YYYY-MM-DD
}

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  displayName: string;
  nativeLanguage: string;
  level: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  registrationLevel: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  role: "student" | "teacher" | "admin";
  totalScore: number;
  avatarUrl: string;
  bio: string;
  classroomId: mongoose.Types.ObjectId | null;
  streak: IStreak;
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
    registrationLevel: {
      type: String,
      enum: ["A1", "A2", "B1", "B2", "C1", "C2"],
      default: "B1",
    },
    role: {
      type: String,
      enum: ["student", "teacher", "admin"],
      default: "student",
    },
    totalScore: {
      type: Number,
      default: 0,
    },
    avatarUrl: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
      maxlength: 300,
    },
    classroomId: {
      type: Schema.Types.ObjectId,
      ref: "Classroom",
      default: null,
    },
    streak: {
      current: { type: Number, default: 0 },
      longest: { type: Number, default: 0 },
      lastActiveDate: { type: String, default: "" },
    },
  },
  {
    timestamps: true,
  }
);

// Prevent re-compilation of the model if it already exists
export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
