import mongoose, { Schema, Document } from "mongoose";
import { ApplicationStatus } from "../../shared/types/index";

export interface IApplication extends Document {
  jobId: mongoose.Types.ObjectId;
  candidateId: mongoose.Types.ObjectId;
  status: ApplicationStatus;
  appliedAt: Date;
  updatedAt: Date;
  coverLetter?: string;
  resumeUrl?: string;
  notes?: string;
}

const ApplicationSchema = new Schema<IApplication>(
  {
    jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true },
    candidateId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["applied", "screening", "interview", "offer", "rejected", "hired"],
      default: "applied",
    },
    coverLetter: { type: String },
    resumeUrl: { type: String },
    notes: { type: String, select: false }, // Internal recruiter notes
  },
  { timestamps: true }
);

// One application per candidate per job
ApplicationSchema.index({ jobId: 1, candidateId: 1 }, { unique: true });

export const Application = mongoose.model<IApplication>("Application", ApplicationSchema);