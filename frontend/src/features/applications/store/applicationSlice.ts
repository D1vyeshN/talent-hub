import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as applicationService from "../services/application.service";
import type { Application, ApplicationStatus } from "@/types";

/* ─── State ──────────────────────────────────────────────────────────── */

interface ApplicationState {
  candidateApplications: Application[];
  recruiterApplications: Application[];
  selectedApplication: Application | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

const initialState: ApplicationState = {
  candidateApplications: [],
  recruiterApplications: [],
  selectedApplication: null,
  isLoading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    pageSize: 10,
    totalPages: 0,
  },
};

/* ─── Thunks ─────────────────────────────────────────────────────────── */

// Candidate thunks
export const fetchCandidateApplications = createAsyncThunk(
  "application/fetchCandidateApplications",
  async (params: { page?: number; pageSize?: number; status?: ApplicationStatus } = {}, { rejectWithValue }) => {
    try {
      return await applicationService.getCandidateApplications(params);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load applications";
      return rejectWithValue(message);
    }
  },
);

export const applyToJob = createAsyncThunk(
  "application/applyToJob",
  async (
    { jobId, companyId, data }: { jobId: string; companyId: string; data: { coverLetter?: string; resumeUrl?: string } },
    { rejectWithValue }
  ) => {
    try {
      return await applicationService.applyToJob(jobId, companyId, data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to apply to job";
      return rejectWithValue(message);
    }
  },
);

export const withdrawApplication = createAsyncThunk(
  "application/withdrawApplication",
  async (applicationId: string, { rejectWithValue }) => {
    try {
      await applicationService.withdrawApplication(applicationId);
      return applicationId;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to withdraw application";
      return rejectWithValue(message);
    }
  },
);

// Recruiter thunks
export const fetchJobApplications = createAsyncThunk(
  "application/fetchJobApplications",
  async (
    { jobId, params }: { jobId: string; params?: { page?: number; pageSize?: number } },
    { rejectWithValue }
  ) => {
    try {
      return await applicationService.getJobApplications(jobId, params);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load job applications";
      return rejectWithValue(message);
    }
  },
);

export const fetchAllRecruiterApplications = createAsyncThunk(
  "application/fetchAllRecruiterApplications",
  async (params: { 
    page?: number; 
    pageSize?: number; 
    search?: string;
    status?: ApplicationStatus;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}, { rejectWithValue }) => {
    try {
      return await applicationService.getAllRecruiterApplications(params);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load applications";
      return rejectWithValue(message);
    }
  },
);

export const updateApplicationStatus = createAsyncThunk(
  "application/updateApplicationStatus",
  async (
    { applicationId, status, notes }: { applicationId: string; status: ApplicationStatus; notes?: string },
    { rejectWithValue }
  ) => {
    try {
      return await applicationService.updateApplicationStatus(applicationId, status, notes);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update application status";
      return rejectWithValue(message);
    }
  },
);

// Shared thunks
export const fetchApplicationById = createAsyncThunk(
  "application/fetchApplicationById",
  async (applicationId: string, { rejectWithValue }) => {
    try {
      return await applicationService.getApplicationById(applicationId);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load application";
      return rejectWithValue(message);
    }
  },
);

/* ─── Slice ──────────────────────────────────────────────────────────── */

const applicationSlice = createSlice({
  name: "application",
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    clearSelectedApplication(state) {
      state.selectedApplication = null;
    },
    clearCandidateApplications(state) {
      state.candidateApplications = [];
    },
    clearRecruiterApplications(state) {
      state.recruiterApplications = [];
    },
  },
  extraReducers: (builder) => {
    builder
      /* fetchCandidateApplications */
      .addCase(fetchCandidateApplications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCandidateApplications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.candidateApplications = action.payload.data;
        state.pagination = {
          total: action.payload.total,
          page: action.payload.page,
          pageSize: action.payload.pageSize,
          totalPages: action.payload.totalPages,
        };
      })
      .addCase(fetchCandidateApplications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      /* applyToJob */
      .addCase(applyToJob.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(applyToJob.fulfilled, (state, action) => {
        state.isLoading = false;
        state.candidateApplications.unshift(action.payload);
      })
      .addCase(applyToJob.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      /* withdrawApplication */
      .addCase(withdrawApplication.fulfilled, (state, action) => {
        state.candidateApplications = state.candidateApplications.filter(
          (app) => app._id !== action.payload
        );
      })
      .addCase(withdrawApplication.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      /* fetchJobApplications */
      .addCase(fetchJobApplications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchJobApplications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.recruiterApplications = action.payload.data;
        state.pagination = {
          total: action.payload.total,
          page: action.payload.page,
          pageSize: action.payload.pageSize,
          totalPages: action.payload.totalPages,
        };
      })
      .addCase(fetchJobApplications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      /* fetchAllRecruiterApplications */
      .addCase(fetchAllRecruiterApplications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllRecruiterApplications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.recruiterApplications = action.payload.data;
        state.pagination = {
          total: action.payload.total,
          page: action.payload.page,
          pageSize: action.payload.pageSize,
          totalPages: action.payload.totalPages,
        };
      })
      .addCase(fetchAllRecruiterApplications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      /* updateApplicationStatus */
      .addCase(updateApplicationStatus.fulfilled, (state, action) => {
        const updatedApplication = action.payload;
        const idx = state.recruiterApplications.findIndex(
          (app) => app._id === updatedApplication._id
        );
        if (idx >= 0) {
          state.recruiterApplications[idx] = updatedApplication;
        }
        // Also update in candidate applications if present
        const candidateIdx = state.candidateApplications.findIndex(
          (app) => app._id === updatedApplication._id
        );
        if (candidateIdx >= 0) {
          state.candidateApplications[candidateIdx] = updatedApplication;
        }
      })
      .addCase(updateApplicationStatus.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      /* fetchApplicationById */
      .addCase(fetchApplicationById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchApplicationById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedApplication = action.payload;
      })
      .addCase(fetchApplicationById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

/* ─── Exports ─────────────────────────────────────────────────────────── */

export const {
  clearError,
  clearSelectedApplication,
  clearCandidateApplications,
  clearRecruiterApplications,
} = applicationSlice.actions;

export default applicationSlice.reducer;
