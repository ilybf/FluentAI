import mongoose, { Schema, Document, Model } from "mongoose";

export interface IChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

export interface IChatSession extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  messages: IChatMessage[];
  lastActive: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>({
  role: { type: String, enum: ["user", "assistant", "system"], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
}, { _id: false }); // Disable auto _id on subdocuments — saves ~12 bytes per message

const ChatSessionSchema = new Schema<IChatSession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // Index for O(1) lookup by userId instead of collection scan
    },
    title: { type: String, default: "New Conversation" },
    messages: { type: [ChatMessageSchema], default: [] },
    lastActive: { type: Date, default: Date.now },
  },
  {
    timestamps: false,
  }
);

// Update lastActive on save
ChatSessionSchema.pre("save", function (next) {
  this.lastActive = new Date();
  next();
});

export const ChatSession: Model<IChatSession> =
  mongoose.models.ChatSession ||
  mongoose.model<IChatSession>("ChatSession", ChatSessionSchema);
