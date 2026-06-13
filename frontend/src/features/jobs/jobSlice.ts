import {
  createSlice,
  createAsyncThunk,
} from "@reduxjs/toolkit";
import { jobsService, JobQueryParams, PaginatedJobsResponse } from "./services/jobs.service";
import { Job, JobStatus } from "@/types";

/* ─── State ──────────────────────────────────────────────────────────── */

interface JobState {
  jobs: Job[];
  currentJob: Job | null;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  filters: JobQueryParams;
  isLoading: boolean;
  error: string | null;
}

const initialState: JobState = {
  jobs: [],
  currentJob: null,
  total: 0,
  page: 1,
  pageSize: 10,
  totalPages: 0,
  filters: {},
  isLoading: false,
  error: null,
};

/* ─── Thunks ─────────────────────────────────────────────────────────── */

export const fetchJobs = createAsyncThunk(
  "jobs/fetchJobs",
  async (params: JobQueryParams = {}, { rejectWithValue }) => {
    try {
      const response = await jobsService.getAll(params);
      return response;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load jobs";
      return rejectWithValue(message);
    }
  },
);

export const fetchJobById = createAsyncThunk(
  "jobs/fetchJobById",
  async (jobId: string, { rejectWithValue }) => {
    try {
      const job = await jobsService.getById(jobId);
      return job;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load job";
      return rejectWithValue(message);
    }
  },
);

export const createJob = createAsyncThunk(
  "jobs/createJob",
  async (payload: Parameters<typeof jobsService.create>[0], { rejectWithValue }) => {
    try {
      const job = await jobsService.create(payload);
      return job;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create job";
      return rejectWithValue(message);
    }
  },
);

export const updateJob = createAsyncThunk(
  "jobs/updateJob",
  async (
    { jobId, payload }: { jobId: string; payload: Parameters<typeof jobsService.update>[1] },
    { rejectWithValue },
  ) => {
    try {
      const job = await jobsService.update(jobId, payload);
      return job;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update job";
      return rejectWithValue(message);
    }
  },
);

export const updateJobStatus = createAsyncThunk(
  "jobs/updateJobStatus",
  async (
    { jobId, status }: { jobId: string; status: JobStatus },
    { rejectWithValue },
  ) => {
    try {
      const job = await jobsService.updateStatus(jobId, status);
      return job;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update job status";
      return rejectWithValue(message);
    }
  },
);

export const deleteJob = createAsyncThunk(
  "jobs/deleteJob",
  async (jobId: string, { rejectWithValue }) => {
    try {
      await jobsService.delete(jobId);
      return jobId;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to delete job";
      return rejectWithValue(message);
    }
  },
);

export const toggleFeatureJob = createAsyncThunk(
  "jobs/toggleFeatureJob",
  async (jobId: string, { rejectWithValue }) => {
    try {
      const job = await jobsService.toggleFeature(jobId);
      return job;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to toggle job feature";
      return rejectWithValue(message);
    }
  },
);

/* ─── Slice ──────────────────────────────────────────────────────────── */

const jobSlice = createSlice({
  name: "jobs",
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    clearJobs(state) {
      state.jobs = [];
      state.total = 0;
      state.page = 1;
      state.totalPages = 0;
    },
    clearCurrentJob(state) {
      state.currentJob = null;
    },
    setFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters(state) {
      state.filters = {};
    },
  },
  extraReducers: (builder) => {
    builder
      /* fetchJobs */
      .addCase(fetchJobs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.isLoading = false;
        // Append jobs if loading more (page > 1), otherwise replace
        if (action.payload.page > 1) {
          state.jobs = [...state.jobs, ...action.payload.data];
        } else {
          state.jobs = action.payload.data;
        }
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.pageSize = action.payload.pageSize;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      /* fetchJobById */
      .addCase(fetchJobById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchJobById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentJob = action.payload;
      })
      .addCase(fetchJobById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      /* createJob */
      .addCase(createJob.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createJob.fulfilled, (state, action) => {
        state.isLoading = false;
        state.jobs.unshift(action.payload);
        state.total += 1;
      })
      .addCase(createJob.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      /* updateJob */
      .addCase(updateJob.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateJob.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedJob = action.payload;
        const idx = state.jobs.findIndex((j) => j._id === updatedJob._id);
        if (idx >= 0) {
          state.jobs[idx] = updatedJob;
        }
        if (state.currentJob?._id === updatedJob._id) {
          state.currentJob = updatedJob;
        }
      })
      .addCase(updateJob.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      /* updateJobStatus */
      .addCase(updateJobStatus.fulfilled, (state, action) => {
        const updatedJob = action.payload;
        const idx = state.jobs.findIndex((j) => j._id === updatedJob._id);
        if (idx >= 0) {
          state.jobs[idx] = updatedJob;
        }
        if (state.currentJob?._id === updatedJob._id) {
          state.currentJob = updatedJob;
        }
      })
      .addCase(updateJobStatus.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      /* deleteJob */
      .addCase(deleteJob.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteJob.fulfilled, (state, action) => {
        state.isLoading = false;
        state.jobs = state.jobs.filter((j) => j._id !== action.payload);
        state.total -= 1;
        if (state.currentJob?._id === action.payload) {
          state.currentJob = null;
        }
      })
      .addCase(deleteJob.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      /* toggleFeatureJob */
      .addCase(toggleFeatureJob.fulfilled, (state, action) => {
        const updatedJob = action.payload;
        const idx = state.jobs.findIndex((j) => j._id === updatedJob._id);
        if (idx >= 0) {
          state.jobs[idx] = updatedJob;
        }
        if (state.currentJob?._id === updatedJob._id) {
          state.currentJob = updatedJob;
        }
      })
      .addCase(toggleFeatureJob.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

/* ─── Exports ─────────────────────────────────────────────────────────── */

export const {
  clearError,
  clearJobs,
  clearCurrentJob,
  setFilters,
  clearFilters,
} = jobSlice.actions;

export default jobSlice.reducer;
