import { Response } from "express";
import * as MessageService from "./message.service";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import { AuthRequest } from "../../middleware/auth.middleware";
import { getPagination } from "../../utils/pagination";
import { z } from "zod";

const sendMessageSchema = z.object({
  receiverId:  z.string().min(1, "Receiver ID is required"),
  content:     z.string().min(1, "Message content is required").max(2000),
  jobContext:  z.string().optional(),
});

// GET /api/v1/messages/conversations
export const getMyConversations = asyncHandler(async (req: AuthRequest, res: Response) => {
  const conversations = await MessageService.getUserConversations(req.userId!);
  res.json(new ApiResponse(200, conversations, "Conversations fetched successfully"));
});

// POST /api/v1/messages
export const sendMessage = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { receiverId, content, jobContext } = sendMessageSchema.parse(req.body);
  const message = await MessageService.sendMessage(
    req.userId!, receiverId, content, jobContext
  );
  res.status(201).json(new ApiResponse(201, message, "Message sent successfully"));
});

// GET /api/v1/messages/conversations/:conversationId
export const getMessages = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page, pageSize } = getPagination(req.query);
  const result = await MessageService.getConversationMessages(
    req.params.conversationId as string, req.userId!, page, pageSize
  );
  res.json(new ApiResponse(200, result, "Messages fetched successfully"));
});

// PATCH /api/v1/messages/conversations/:conversationId/read
export const markAsRead = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await MessageService.markMessagesAsRead(
    req.params.conversationId as string, req.userId!
  );
  res.json(new ApiResponse(200, result, "Messages marked as read"));
});