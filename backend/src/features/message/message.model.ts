import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
  senderId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  content: string;
  sentAt: Date;
  read: boolean;
  conversationId: mongoose.Types.ObjectId;
}

const MessageSchema = new Schema<IMessage>({
  senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  receiverId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true, trim: true },
  sentAt: { type: Date, default: Date.now },
  read: { type: Boolean, default: false },
  conversationId: { type: Schema.Types.ObjectId, ref: "Conversation", required: true },
});

export const Message = mongoose.model<IMessage>("Message", MessageSchema);