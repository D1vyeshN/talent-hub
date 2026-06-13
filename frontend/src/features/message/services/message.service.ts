/**
 * Message service — typed wrappers around apiClient.
 *
 * Matches backend endpoints:
 *  - GET /api/message/conversations — get user conversations
 *  - GET /api/message/conversations/:id — get messages in a conversation
 *  - PATCH /api/message/conversations/:id/read — mark as read
 *  - POST /api/message — send a message
 */

import { apiClient } from "@/shared/lib/apiClient";
import type { Message, Conversation } from "@/types";

export interface PaginatedMessages {
  data: Message[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const messageService = {
  /** GET /api/message/conversations — get user conversations */
  getConversations: (): Promise<Conversation[]> => {
    return apiClient.get<Conversation[]>("/api/message/conversations");
  },

  /** GET /api/message/conversations/:conversationId — get messages in a conversation */
  getMessages: (
    conversationId: string,
    params?: { page?: number; pageSize?: number }
  ): Promise<PaginatedMessages> => {
    const filteredParams = Object.fromEntries(
      Object.entries(params || {}).filter(([, value]) => value !== undefined)
    );
    return apiClient.get<PaginatedMessages>(
      `/api/message/conversations/${conversationId}`,
      filteredParams as any
    );
  },

  /** PATCH /api/message/conversations/:conversationId/read — mark as read */
  markAsRead: (conversationId: string): Promise<{ message: string }> => {
    return apiClient.patch<{ message: string }>(
      `/api/message/conversations/${conversationId}/read`,
      {}
    );
  },

  /** POST /api/message — send a message */
  sendMessage: (data: {
    receiverId: string;
    content: string;
    jobContext?: string;
  }): Promise<Message> => {
    return apiClient.post<Message>("/api/message", data);
  },
};
