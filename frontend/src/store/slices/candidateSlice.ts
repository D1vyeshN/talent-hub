import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type { Candidate, Application, Job } from "@/types";
import * as CandidateService from "@/features/candidate/services/candidate.service";

// ─── State ───────────────────────────────────────────────────────────────────────

interface CandidateState {
  profile: Candidate | null;
  applications: Application[];
  savedJobs: Job[];
  isLoading: boolean;
  error: string | null;
}

const initialState: CandidateState = {
  profile: null,
  applications: [],
  savedJobs: [],
  isLoading: false,
  error: null,
};

// ─── Async Thunks ───────────────────────────────────────────────────────────────

export const fetchCandidateProfile = createAsyncThunk(
  "candidate/fetchProfile",
  async () => {
    return await CandidateService.getCandidateProfile();
  }
);

export const updateProfile = createAsyncThunk(
  "candidate/updateProfile",
  async (updates: Partial<Candidate>) => {
    return await CandidateService.updateCandidateProfile(updates);
  }
);

export const toggleSaveJob = createAsyncThunk(
  "candidate/toggleSaveJob",
  async ({ jobId, isSaved }: { jobId: string; isSaved: boolean }) => {
    if (isSaved) {
      return await CandidateService.unsaveJob(jobId);
    } else {
      return await CandidateService.saveJob(jobId);
    }
  }
);

export const fetchApplications = createAsyncThunk(
  "candidate/fetchApplications",
  async ({ page = 1, pageSize = 10 }: { page?: number; pageSize?: number } = {}) => {
    const response = await CandidateService.getCandidateApplications(page, pageSize);
    return response.data;
  }
);

export const applyToJob = createAsyncThunk(
  "candidate/applyToJob",
  async ({ jobId, data }: { jobId: string; data: { coverLetter?: string; resumeUrl?: string } }) => {
    return await CandidateService.applyToJob(jobId, data);
  }
);

export const withdrawApplication = createAsyncThunk(
  "candidate/withdrawApplication",
  async (applicationId: string) => {
    return await CandidateService.withdrawApplication(applicationId);
  }
);

export const uploadResume = createAsyncThunk(
  "candidate/uploadResume",
  async (file: File) => {
    return await CandidateService.uploadResume(file);
  }
);

export const uploadAvatar = createAsyncThunk(
  "candidate/uploadAvatar",
  async (file: File) => {
    return await CandidateService.uploadAvatar(file);
  }
);

export const addSkill = createAsyncThunk(
  "candidate/addSkill",
  async (skill: string) => {
    return await CandidateService.addSkill(skill);
  }
);

export const removeSkill = createAsyncThunk(
  "candidate/removeSkill",
  async (skill: string) => {
    return await CandidateService.removeSkill(skill);
  }
);

export const fetchSavedJobs = createAsyncThunk(
  "candidate/fetchSavedJobs",
  async (jobIds: string[]) => {
    return await CandidateService.getSavedJobsDetails(jobIds);
  }
);

export const addEducation = createAsyncThunk(
  "candidate/addEducation",
  async (education: any) => {
    return await CandidateService.addEducation(education);
  }
);

export const removeEducation = createAsyncThunk(
  "candidate/removeEducation",
  async (educationId: string) => {
    return await CandidateService.removeEducation(educationId);
  }
);

export const addWorkExperience = createAsyncThunk(
  "candidate/addWorkExperience",
  async (experience: any) => {
    return await CandidateService.addWorkExperience(experience);
  }
);

export const removeWorkExperience = createAsyncThunk(
  "candidate/removeWorkExperience",
  async (experienceId: string) => {
    return await CandidateService.removeWorkExperience(experienceId);
  }
);

// ─── Slice ───────────────────────────────────────────────────────────────────────

const candidateSlice = createSlice({
  name: "candidate",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Profile
    builder
      .addCase(fetchCandidateProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCandidateProfile.fulfilled, (state, action: PayloadAction<Candidate>) => {
        state.isLoading = false;
        state.profile = action.payload;
      })
      .addCase(fetchCandidateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to fetch profile";
      });

    // Update Profile
    builder
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action: PayloadAction<Candidate>) => {
        state.isLoading = false;
        state.profile = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to update profile";
      });

    // Toggle Save Job
    builder
      .addCase(toggleSaveJob.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(toggleSaveJob.fulfilled, (state, action: PayloadAction<Candidate>) => {
        state.isLoading = false;
        state.profile = action.payload;
      })
      .addCase(toggleSaveJob.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to save/unsave job";
      });

    // Fetch Applications
    builder
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
        state.error = action.error.message || "Failed to fetch applications";
      });

    // Apply to Job
    builder
      .addCase(applyToJob.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(applyToJob.fulfilled, (state, action: PayloadAction<Application>) => {
        state.isLoading = false;
        state.applications.unshift(action.payload);
      })
      .addCase(applyToJob.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to apply to job";
      });

    // Withdraw Application
    builder
      .addCase(withdrawApplication.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(withdrawApplication.fulfilled, (state, action: PayloadAction<Application>) => {
        state.isLoading = false;
        state.applications = state.applications.filter((app) => app._id !== action.payload._id);
      })
      .addCase(withdrawApplication.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to withdraw application";
      });

    // Upload Resume
    builder
      .addCase(uploadResume.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(uploadResume.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.profile) {
          state.profile.resumeUrl = action.payload.resumeUrl;
        }
      })
      .addCase(uploadResume.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to upload resume";
      });

    // Upload Avatar
    builder
      .addCase(uploadAvatar.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(uploadAvatar.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.profile) {
          state.profile.avatar = action.payload.avatar;
        }
      })
      .addCase(uploadAvatar.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to upload avatar";
      });

    // Add Skill
    builder
      .addCase(addSkill.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addSkill.fulfilled, (state, action: PayloadAction<Candidate>) => {
        state.isLoading = false;
        state.profile = action.payload;
      })
      .addCase(addSkill.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to add skill";
      });

    // Remove Skill
    builder
      .addCase(removeSkill.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removeSkill.fulfilled, (state, action: PayloadAction<Candidate>) => {
        state.isLoading = false;
        state.profile = action.payload;
      })
      .addCase(removeSkill.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to remove skill";
      });

    // Fetch Saved Jobs
    builder
      .addCase(fetchSavedJobs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSavedJobs.fulfilled, (state, action: PayloadAction<Job[]>) => {
        state.isLoading = false;
        state.savedJobs = action.payload;
      })
      .addCase(fetchSavedJobs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to fetch saved jobs";
      });

    // Add Education
    builder
      .addCase(addEducation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addEducation.fulfilled, (state, action: PayloadAction<Candidate>) => {
        state.isLoading = false;
        state.profile = action.payload;
      })
      .addCase(addEducation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to add education";
      });

    // Remove Education
    builder
      .addCase(removeEducation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removeEducation.fulfilled, (state, action: PayloadAction<Candidate>) => {
        state.isLoading = false;
        state.profile = action.payload;
      })
      .addCase(removeEducation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to remove education";
      });

    // Add Work Experience
    builder
      .addCase(addWorkExperience.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addWorkExperience.fulfilled, (state, action: PayloadAction<Candidate>) => {
        state.isLoading = false;
        state.profile = action.payload;
      })
      .addCase(addWorkExperience.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to add work experience";
      });

    // Remove Work Experience
    builder
      .addCase(removeWorkExperience.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removeWorkExperience.fulfilled, (state, action: PayloadAction<Candidate>) => {
        state.isLoading = false;
        state.profile = action.payload;
      })
      .addCase(removeWorkExperience.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to remove work experience";
      });
  },
});

export const { clearError } = candidateSlice.actions;
export default candidateSlice.reducer;
