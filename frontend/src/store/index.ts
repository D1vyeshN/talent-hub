import { configureStore } from "@reduxjs/toolkit";
import uiReducer from "./slices/uiSlice";
import authReducer, { logout } from "@/features/auth/store/authSlice";
import recruiterReducer from "@/features/recruiter/recruiterSlice";
import candidateReducer from "./slices/candidateSlice";
import applicationReducer from "@/features/applications/store/applicationSlice";
import notificationReducer from "@/features/notifications/store/notificationSlice";
import jobReducer from "@/features/jobs/jobSlice";
import messageReducer from "@/features/message/store/messageSlice";
import { setUnauthorizedHandler } from "@/shared/lib/apiClient";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    recruiter: recruiterReducer,
    candidate: candidateReducer,
    application: applicationReducer,
    notification: notificationReducer,
    job: jobReducer,
    message: messageReducer,
  },
  devTools: true,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

// Wire 401 handling: when apiClient detects an expired/invalid token,
// it calls this → we dispatch logout() which clears Redux + cookies.
export const setup401Handler = () => {
  setUnauthorizedHandler(() => {
    const state = store.getState();
    // Only logout if user was actually authenticated
    if (state.auth.isAuthenticated) {
      store.dispatch(logout());
    }
  });
};

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
