import mongoose, { Schema, Document } from "mongoose";
import { JobType, JobLevel, JobStatus } from "@/shared/types/index";

export interface IJob extends Document {
  title: string;
  company: mongoose.Types.ObjectId | string;
  location: string;
  type: JobType;
  level: JobLevel;
  salary: { min: number; max: number; currency: string; period: string };
  description: string;
  requirements: string[];
  responsibilities: string[];
  skills: string[];
  postedAt: Date;
  expiresAt: Date;
  status: JobStatus;
  applicantsCount: number;
  viewsCount: number;
  isFeatured: boolean;
  isRemote: boolean;
  recruiter: mongoose.Types.ObjectId | string;
  category: string;
}

const SalarySchema = new Schema(
  {
    min: { type: Number, required: true },
    max: { type: Number, required: true },
    currency: { type: String, default: "USD" },
    period: { type: String, enum: ["monthly", "yearly"], default: "yearly" },
  },
  { _id: false }
);

const JobSchema = new Schema<IJob>(
  {
    title: { type: String, required: true, trim: true, index: true },
    company: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    location: { type: String, required: true },
    type: {
      type: String,
      enum: ["full-time", "part-time", "contract", "internship", "remote"],
      required: true,
    },
    level: {
      type: String,
      enum: ["entry", "mid", "senior", "lead", "executive"],
      required: true,
    },
    salary: { type: SalarySchema, required: true },
    description: { type: String, required: true },
    requirements: { type: [String], default: [] },
    responsibilities: { type: [String], default: [] },
    skills: { type: [String], default: [], index: true },
    postedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date },
    status: {
      type: String,
      enum: ["active", "closed", "draft", "paused"],
      default: "draft",
    },
    applicantsCount: { type: Number, default: 0 },
    viewsCount: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    isRemote: { type: Boolean, default: false },
    recruiter: { type: Schema.Types.ObjectId, ref: "User", required: true },
    category: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

// Text index for full-text search
JobSchema.index({ title: "text", description: "text", skills: "text" });

export const Job = mongoose.model<IJob>("Job", JobSchema);