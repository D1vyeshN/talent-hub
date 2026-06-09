import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { authService } from "../services/auth.service";
import { getCookie, setCookie, deleteCookie } from "@/shared/lib/apiClient";
import type { User, UserRole } from "@/types";

// ─── State ──────────────────────────────────────────────────────────────────

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  role: UserRole | null;
  isLoading: boolean;
  error: string | null;
  initialized: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  role: null,
  isLoading: false,
  error: null,
  initialized: false,
};

// ─── Thunks ─────────────────────────────────────────────────────────────────

export const login = createAsyncThunk(
  "auth/login",
  async (
    credentials: { email: string; password: string },
    { rejectWithValue },
  ) => {
    try {
      const data = await authService.login(
        credentials.email,
        credentials.password,
      );
      // Token stored in cookie by backend; also store it here for the header interceptor
      // (belt-and-suspenders: backend sets httpOnly cookie, we also write a client-accessible copy)
      // The cookie is already set via apiClient's setCookie in the login flow...
      // Actually the service already had backend setting the cookie. Let's keep it simple:
      // The request interceptor reads from cookie, which backend already set as httpOnly.
      // No client-side cookie write needed here. The httpOnly cookie is enough.
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message || "Login failed");
    }
  },
);

export const register = createAsyncThunk(
  "auth/register",
  async (
    data: { name: string; email: string; password: string; role: UserRole },
    { rejectWithValue },
  ) => {
    try {
      return await authService.register(data);
    } catch (err: any) {
      return rejectWithValue(err.message || "Registration failed");
    }
  },
);

export const fetchCurrentUser = createAsyncThunk(
  "auth/getMe",
  async (_void, { rejectWithValue }) => {
    try {
      return await authService.getMe();
    } catch (err: any) {
      return rejectWithValue(err.message || "Session expired");
    }
  },
);

export const logout = createAsyncThunk(
  "auth/logout",
  async (_void, { rejectWithValue }) => {
    try {
      return await authService.logout();
    } catch (err: any) {
      return rejectWithValue(err.message || "Session expired");
    }
  },
);

// ─── Slice ──────────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // login
    builder.addCase(login.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(login.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.role = action.payload.user.role;
      state.error = null;
    });
    builder.addCase(login.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // logout
    builder.addCase(logout.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(logout.fulfilled, (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.role = null;
      state.isLoading = false;
      state.error = null;
    });
    builder.addCase(logout.rejected, (state) => {
      state.isLoading = false;
      state.user = null;
      state.isAuthenticated = false;
      state.role = null;
    });

    // register
    builder.addCase(register.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(register.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.role = action.payload.user.role;
      state.error = null;
    });
    builder.addCase(register.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // getMe
    builder.addCase(fetchCurrentUser.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchCurrentUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload;
      state.isAuthenticated = true;
      state.role = action.payload.role;
      state.initialized = true;
      // state.error = null;
    });
    builder.addCase(fetchCurrentUser.rejected, (state, action) => {
      state.isLoading = false;
      state.user = null;
      state.isAuthenticated = false;
      state.role = null;
      state.initialized = true;
      // state.error = action.payload as string;
    });
  },
});

// ─── Exports ─────────────────────────────────────────────────────────────────

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
