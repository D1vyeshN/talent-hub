import {
  createSlice,
  createAsyncThunk,
} from "@reduxjs/toolkit";
import { recruiterProfileService } from "@/features/recruiterProfile/services/recruiterProfile.service";
import { Application, ApplicationStatus, Candidate, Job, JobStatus } from "@/types";

/* ─── State ──────────────────────────────────────────────────────────── */

interface RecruiterProfileState {
  jobs: Job[];
  applications: Application[];
  candidates: Candidate[];
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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load dashboard";
      return rejectWithValue(message);
    }
  },
);

export const fetchJobs = createAsyncThunk(
  "recruiterProfile/fetchJobs",
  async (_void, { rejectWithValue }) => {
    try {
      const response = await recruiterProfileService.getJobs();
      // Service returns paginated response { data, total, page, pageSize, totalPages }
      // Extract the data array for the slice
      return response.data;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load jobs";
      return rejectWithValue(message);
    }
  },
);

export const fetchApplications = createAsyncThunk(
  "recruiterProfile/fetchApplications",
  async (_void, { rejectWithValue }) => {
    try {
      return await recruiterProfileService.getApplications();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load applications";
      return rejectWithValue(message);
    }
  },
);

export const fetchCandidates = createAsyncThunk(
  "recruiterProfile/fetchCandidates",
  async (_void, { rejectWithValue }) => {
    try {
      return await recruiterProfileService.getCandidates();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load candidates";
      return rejectWithValue(message);
    }
  },
);

export const updateJobStatus = createAsyncThunk(
  "recruiterProfile/updateJobStatus",
  async (
    { jobId, status }: { jobId: string; status: JobStatus },
    { rejectWithValue },
  ) => {
    try {
      const response = await recruiterProfileService.updateJobStatus(jobId, status);
      return response.data;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update job status";
      return rejectWithValue(message);
    }
  },
);

export const removeJob = createAsyncThunk(
  "recruiterProfile/removeJob",
  async (jobId: string, { rejectWithValue }) => {
    try {
      await recruiterProfileService.deleteJob(jobId);
      return jobId;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to delete job";
      return rejectWithValue(message);
    }
  },
);

export const updateApplicationStatus = createAsyncThunk(
  "recruiterProfile/updateApplicationStatus",
  async (
    { applicationId, status }: { applicationId: string; status: ApplicationStatus },
    { rejectWithValue },
  ) => {
    try {
      return await recruiterProfileService.updateApplicationStatus(applicationId, status);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update application";
      return rejectWithValue(message);
    }
  },
);

export const toggleSaveCandidate = createAsyncThunk(
  "recruiterProfile/toggleSaveCandidate",
  async (candidateId: string, { rejectWithValue }) => {
    try {
      await recruiterProfileService.saveCandidate(candidateId);
      return candidateId;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save candidate";
      return rejectWithValue(message);
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
        const updatedJob = action.payload;
        const idx = state.jobs.findIndex(
          (j) => j._id === updatedJob?._id,
        );
        if (idx >= 0 && updatedJob) state.jobs[idx] = updatedJob;
      })
      .addCase(updateJobStatus.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      /* removeJob */
      .addCase(removeJob.fulfilled, (state, action) => {
        state.jobs = state.jobs.filter((j) => j._id !== action.payload);
      })
      .addCase(removeJob.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      /* updateApplicationStatus */
      .addCase(updateApplicationStatus.fulfilled, (state, action) => {
        const updatedApplication = action.payload;
        const idx = state.applications.findIndex(
          (a) => a._id === updatedApplication?._id,
        );
        if (idx >= 0 && updatedApplication) state.applications[idx] = updatedApplication;
      })
      .addCase(updateApplicationStatus.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      /* toggleSaveCandidate */
      .addCase(toggleSaveCandidate.fulfilled, (state, action) => {
        const idx = state.candidates.findIndex(
          (c) => c._id === action.payload,
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
