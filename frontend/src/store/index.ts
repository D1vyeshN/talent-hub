import { configureStore } from "@reduxjs/toolkit";
import uiReducer from "./slices/uiSlice";
import authReducer, { logout } from "@/features/auth/store/authSlice";
import recruiterProfileReducer from "@/features/recruiterProfile/store/recruiterProfileSlice";
import { setUnauthorizedHandler } from "@/shared/lib/apiClient";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    recruiterProfile: recruiterProfileReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

// Wire 401 handling: when apiClient detects an expired/invalid token,
// it calls this → we dispatch logout() which clears Redux + cookies.
export const setup401Handler = () => {
  // setUnauthorizedHandler(() => store.dispatch(logout()));
};

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
