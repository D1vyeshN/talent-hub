import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { notificationService } from "../services/notification.service";
import type { Notification, NotificationType } from "@/types";

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
  isLoading: boolean;
  error: string | null;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  pagination: {
    total: 0,
    page: 1,
    pageSize: 10,
    totalPages: 0,
  },
  isLoading: false,
  error: null,
};

// Thunks
export const fetchNotifications = createAsyncThunk(
  "notification/fetchNotifications",
  async (params: { page?: number; pageSize?: number } = {}, { rejectWithValue }) => {
    try {
      return await notificationService.getNotifications(params);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to fetch notifications";
      return rejectWithValue(message);
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  "notification/fetchUnreadCount",
  async (_void, { rejectWithValue }) => {
    try {
      return await notificationService.getUnreadCount();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to fetch unread count";
      return rejectWithValue(message);
    }
  }
);

export const markAsRead = createAsyncThunk(
  "notification/markAsRead",
  async (notificationId: string, { rejectWithValue }) => {
    try {
      return await notificationService.markAsRead(notificationId);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to mark notification as read";
      return rejectWithValue(message);
    }
  }
);

export const markAllAsRead = createAsyncThunk(
  "notification/markAllAsRead",
  async (_void, { rejectWithValue }) => {
    try {
      return await notificationService.markAllAsRead();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to mark all as read";
      return rejectWithValue(message);
    }
  }
);

export const deleteNotification = createAsyncThunk(
  "notification/deleteNotification",
  async (notificationId: string, { rejectWithValue }) => {
    try {
      await notificationService.deleteNotification(notificationId);
      return notificationId;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to delete notification";
      return rejectWithValue(message);
    }
  }
);

// Slice
const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    // Socket.io event handlers
    newNotificationReceived(state, action: PayloadAction<Notification>) {
      state.notifications.unshift(action.payload);
      state.unreadCount += 1;
      state.pagination.total += 1;
    },
    unreadCountUpdated(state, action: PayloadAction<{ unreadCount: number }>) {
      state.unreadCount = action.payload.unreadCount;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchNotifications
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications = action.payload.data;
        state.pagination = {
          total: action.payload.total,
          page: action.payload.page,
          pageSize: action.payload.pageSize,
          totalPages: action.payload.totalPages,
        };
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // fetchUnreadCount
      .addCase(fetchUnreadCount.pending, (state) => {
        // No loading toggle for unread count to avoid conflict with notifications loading
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload.unreadCount;
      })
      .addCase(fetchUnreadCount.rejected, (state, action) => {
        // Optionally set error, but we can ignore for now
      })
      // markAsRead
      .addCase(markAsRead.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        state.isLoading = false;
        const updated = action.payload;
        state.notifications = state.notifications.map((n) =>
          n._id === updated._id ? { ...n, read: true } : n
        );
        // Unread count will be refreshed by the component after mutation
      })
      .addCase(markAsRead.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // markAllAsRead
      .addCase(markAllAsRead.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(markAllAsRead.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications = state.notifications.map((n) => ({ ...n, read: true }));
        state.unreadCount = 0;
      })
      .addCase(markAllAsRead.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // deleteNotification
      .addCase(deleteNotification.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.isLoading = false;
        const deletedId = action.payload;
        state.notifications = state.notifications.filter((n) => n._id !== deletedId);
        // Unread count will be refreshed by the component after mutation
      })
      .addCase(deleteNotification.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, newNotificationReceived, unreadCountUpdated } = notificationSlice.actions;
export default notificationSlice.reducer;