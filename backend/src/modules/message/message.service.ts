import { Message } from "./message.model";
import { Conversation } from "./conversation.model";
import { ApiError } from "../../utils/ApiError";
import { buildPaginatedResponse } from "../../utils/pagination";
import mongoose from "mongoose";
import { createNotification } from "../notification/notification.service";

// ─── Get or create a conversation between two users ───────────────────────────
export const getOrCreateConversation = async (
  userAId: string,
  userBId: string,
  jobContext?: string
) => {
  let conversation = await Conversation.findOne({
    participants: { $all: [userAId, userBId] },
  });

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [userAId, userBId],
      unreadCount:  0,
      jobContext:   jobContext || null,
    });
  }

  return conversation;
};

// ─── Get all conversations for a user ────────────────────────────────────────
export const getUserConversations = async (userId: string) => {
  return Conversation.find({ participants: userId })
    .populate("participants", "name avatar role")
    .populate("lastMessage")
    .populate("jobContext", "title")
    .sort({ updatedAt: -1 });
};

// ─── Send a message ───────────────────────────────────────────────────────────
export const sendMessage = async (
  senderId: string,
  receiverId: string,
  content: string,
  jobContext?: string
) => {
  const conversation = await getOrCreateConversation(senderId, receiverId, jobContext);

  const message = await Message.create({
    senderId,
    receiverId,
    content,
    conversationId: conversation._id,
  });

  // Update conversation with latest message
  await Conversation.findByIdAndUpdate(conversation._id, {
    lastMessage: message._id,
    $inc: { unreadCount: 1 },
    updatedAt:   new Date(),
  });

  // Create notification for receiver (fire-and-forget)
  createNotification({
    userId: receiverId,
    type: "new_message",
    title: "New message",
    message: `You have a new message from ${senderId}`,
    actionUrl: `/messages/${conversation._id}`,
  }).catch(console.error);

  return message;
};

// ─── Get messages in a conversation ──────────────────────────────────────────
export const getConversationMessages = async (
  conversationId: string,
  userId: string,
  page: number,
  pageSize: number
) => {
  // Ensure the user is a participant
  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: userId,
  });
  if (!conversation) throw new ApiError(403, "Access denied to this conversation");

  const skip = (page - 1) * pageSize;
  const [data, total] = await Promise.all([
    Message.find({ conversationId })
      .sort({ sentAt: 1 })
      .skip(skip)
      .limit(pageSize),
      // .populate("senderId", "name avatar"),
    Message.countDocuments({ conversationId }),
  ]);

  return buildPaginatedResponse(data, total, page, pageSize);
};

// ─── Mark messages as read ────────────────────────────────────────────────────
export const markMessagesAsRead = async (
  conversationId: string,
  userId: string
) => {
  await Message.updateMany(
    { conversationId, receiverId: userId, read: false },
    { $set: { read: true } }
  );

  await Conversation.findByIdAndUpdate(conversationId, {
    $set: { unreadCount: 0 },
  });

  return { message: "Messages marked as read" };
};