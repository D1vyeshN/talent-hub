import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { recruiterProfileService } from "@/features/recruiterProfile/services/recruiterProfile.service";

/* ─── State ──────────────────────────────────────────────────────────── */

interface RecruiterProfileState {
  jobs: any[];
  applications: any[];
  candidates: any[];
  stats: {
    activeJobs: number;
    totalApplicants: number;
    interviewsScheduled: number;
    positionsFilled: number;
  } | null;
  analytics: {
    jobViews: { label: string; value: number }[];
    hired: { label: string; value: number }[];
  } | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: RecruiterProfileState = {
  jobs: [],
  applications: [],
  candidates: [],
  stats: null,
  analytics: null,
  isLoading: false,
  error: null,
};

/* ─── Thunks ─────────────────────────────────────────────────────────── */

export const fetchDashboard = createAsyncThunk(
  "recruiterProfile/fetchDashboard",
  async (_void, { rejectWithValue }) => {
    try {
      return await recruiterProfileService.getDashboard();
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to load dashboard");
    }
  },
);

export const fetchJobs = createAsyncThunk(
  "recruiterProfile/fetchJobs",
  async (_void, { rejectWithValue }) => {
    try {
      return await recruiterProfileService.getJobs();
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to load jobs");
    }
  },
);

export const fetchApplications = createAsyncThunk(
  "recruiterProfile/fetchApplications",
  async (_void, { rejectWithValue }) => {
    try {
      return await recruiterProfileService.getApplications();
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to load applications");
    }
  },
);

export const fetchCandidates = createAsyncThunk(
  "recruiterProfile/fetchCandidates",
  async (_void, { rejectWithValue }) => {
    try {
      return await recruiterProfileService.getCandidates();
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to load candidates");
    }
  },
);

export const updateJobStatus = createAsyncThunk(
  "recruiterProfile/updateJobStatus",
  async (
    { jobId, status }: { jobId: string; status: string },
    { rejectWithValue },
  ) => {
    try {
      return await recruiterProfileService.updateJobStatus(
        jobId,
        status as any,
      );
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to update job status");
    }
  },
);

export const removeJob = createAsyncThunk(
  "recruiterProfile/removeJob",
  async (jobId: string, { rejectWithValue }) => {
    try {
      await recruiterProfileService.deleteJob(jobId);
      return jobId;
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to delete job");
    }
  },
);

export const updateApplicationStatus = createAsyncThunk(
  "recruiterProfile/updateApplicationStatus",
  async (
    { applicationId, status }: { applicationId: string; status: string },
    { rejectWithValue },
  ) => {
    try {
      return await recruiterProfileService.updateApplicationStatus({
        id: applicationId,
        status: status as any,
      });
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to update application");
    }
  },
);

export const toggleSaveCandidate = createAsyncThunk(
  "recruiterProfile/toggleSaveCandidate",
  async (candidateId: string, { rejectWithValue }) => {
    try {
      await recruiterProfileService.saveCandidate(candidateId);
      return candidateId;
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to save candidate");
    }
  },
);

/* ─── Slice ──────────────────────────────────────────────────────────── */

const recruiterProfileSlice = createSlice({
  name: "recruiterProfile",
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    clearJobs(state) {
      state.jobs = [];
    },
  },
  extraReducers: (builder) => {
    builder
      /* fetchDashboard */
      .addCase(fetchDashboard.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.isLoading = false;
        state.jobs = action.payload.jobs;
        state.applications = action.payload.applications;
        state.stats = action.payload.stats;
        state.analytics = action.payload.analytics;
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      /* fetchJobs */
      .addCase(fetchJobs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.jobs = action.payload;
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      /* fetchApplications */
      .addCase(fetchApplications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchApplications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.applications = action.payload;
      })
      .addCase(fetchApplications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      /* fetchCandidates */
      .addCase(fetchCandidates.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCandidates.fulfilled, (state, action) => {
        state.isLoading = false;
        state.candidates = action.payload;
      })
      .addCase(fetchCandidates.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      /* updateJobStatus */
      .addCase(updateJobStatus.fulfilled, (state, action) => {
        const idx = state.jobs.findIndex(
          (j: any) => j.id === action.payload?.id,
        );
        if (idx >= 0) state.jobs[idx] = action.payload;
      })
      .addCase(updateJobStatus.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      /* removeJob */
      .addCase(removeJob.fulfilled, (state, action) => {
        state.jobs = state.jobs.filter((j: any) => j.id !== action.payload);
      })
      .addCase(removeJob.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      /* updateApplicationStatus */
      .addCase(updateApplicationStatus.fulfilled, (state, action) => {
        const idx = state.applications.findIndex(
          (a: any) => a.id === action.payload?.id,
        );
        if (idx >= 0) state.applications[idx] = action.payload;
      })
      .addCase(updateApplicationStatus.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      /* toggleSaveCandidate */
      .addCase(toggleSaveCandidate.fulfilled, (state, action) => {
        const idx = state.candidates.findIndex(
          (c: any) => c.id === action.payload,
        );
        if (idx >= 0) {
          state.candidates[idx] = {
            ...state.candidates[idx],
            saved: !state.candidates[idx]?.saved,
          };
        }
      })
      .addCase(toggleSaveCandidate.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

/* ─── Exports ─────────────────────────────────────────────────────────── */

export const { clearError, clearJobs } = recruiterProfileSlice.actions;
export default recruiterProfileSlice.reducer;
