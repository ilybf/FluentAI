import mongoose, { Schema, Document, Model } from "mongoose";

export interface IClassroom extends Document {
  teacherId: mongoose.Types.ObjectId;
  name: string;
  description: string;
  joinCode: string;
  studentIds: mongoose.Types.ObjectId[];
  maxStudents: number;
  createdAt: Date;
  updatedAt: Date;
}

const ClassroomSchema = new Schema<IClassroom>(
  {
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      default: "",
      maxlength: 500,
    },
    joinCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    studentIds: {
      type: [{ type: Schema.Types.ObjectId, ref: "User" }],
      default: [],
    },
    maxStudents: {
      type: Number,
      default: 30,
      max: 30,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Generate a random 6-character join code (uppercase alphanumeric).
 * Avoids ambiguous characters (0, O, I, L, 1).
 */
export function generateJoinCode(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export const Classroom: Model<IClassroom> =
  mongoose.models.Classroom ||
  mongoose.model<IClassroom>("Classroom", ClassroomSchema);
