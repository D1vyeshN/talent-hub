import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { messageService } from "../services/message.service";
import type { Message, Conversation } from "@/types";



interface MessageState {
  conversations: Conversation[];
  messages: Message[];
  currentConversationId: string | null;
  tempConversation: Conversation | null;
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
  isLoading: boolean;
  error: string | null;
}

const initialState: MessageState = {
  conversations: [],
  messages: [],
  currentConversationId: null,
  tempConversation: null,
  pagination: {
    total: 0,
    page: 1,
    pageSize: 20,
    totalPages: 0,
  },
  isLoading: false,
  error: null,
};

// Thunks
export const fetchConversations = createAsyncThunk(
  "message/fetchConversations",
  async (_void, { rejectWithValue }) => {
    try {
      return await messageService.getConversations();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to fetch conversations";
      return rejectWithValue(message);
    }
  }
);

export const fetchMessages = createAsyncThunk(
  "message/fetchMessages",
  async (
    { conversationId, page = 1, pageSize = 20 }: { conversationId: string; page?: number; pageSize?: number },
    { rejectWithValue }
  ) => {
    try {
      return await messageService.getMessages(conversationId, { page, pageSize });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to fetch messages";
      return rejectWithValue(message);
    }
  }
);

export const sendMessage = createAsyncThunk(
  "message/sendMessage",
  async (data: { receiverId: string; content: string; jobContext?: string }, { rejectWithValue }) => {
    try {
      return await messageService.sendMessage(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to send message";
      return rejectWithValue(message);
    }
  }
);

export const markAsRead = createAsyncThunk(
  "message/markAsRead",
  async (conversationId: string, { rejectWithValue }) => {
    try {
      return await messageService.markAsRead(conversationId);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to mark as read";
      return rejectWithValue(message);
    }
  }
);

// Slice
const messageSlice = createSlice({
  name: "message",
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    setCurrentConversation(state, action: PayloadAction<string | null>) {
      state.currentConversationId = action.payload;
    },
    // Socket.io event handlers
    newMessageReceived(state, action: PayloadAction<Message>) {
      state.messages.push(action.payload);
    },
    messageSent(state, action: PayloadAction<Message>) {
      state.messages.push(action.payload);
    },
    newTempConversation(state, action: PayloadAction<Conversation>) {
      state.tempConversation = action.payload;
    },
    clearTempConversation(state) {
      state.tempConversation = null;
    },
    conversationUpdated(state, action: PayloadAction<Conversation>) {
      const index = state.conversations.findIndex((c) => c._id === action.payload._id);
      if (index !== -1) {
        state.conversations[index] = action.payload;
      } else {
        state.conversations.unshift(action.payload);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchConversations
      .addCase(fetchConversations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.conversations = !state.tempConversation ? action.payload : [state.tempConversation, ...action.payload];
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // fetchMessages
      .addCase(fetchMessages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.messages = action.payload.data;
        state.pagination = {
          total: action.payload.total,
          page: action.payload.page,
          pageSize: action.payload.pageSize,
          totalPages: action.payload.totalPages,
        };
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // sendMessage
      .addCase(sendMessage.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(sendMessage.fulfilled, (state) => {
        state.isLoading = false;
        state.tempConversation = null;
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // markAsRead
      .addCase(markAsRead.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(markAsRead.fulfilled, (state) => {
        state.isLoading = false;
        // Update conversation unread count
        const conv = state.conversations.find((c) => c._id === state.currentConversationId);
        if (conv) {
          conv.unreadCount = 0;
        }
      })
      .addCase(markAsRead.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  setCurrentConversation,
  newMessageReceived,
  messageSent,
  newTempConversation,
  clearTempConversation,
  conversationUpdated,
} = messageSlice.actions;

export default messageSlice.reducer;
