import { Schema } from "mongoose";
import { User } from "../users/user.model";

const CandidateSchema = new Schema({
  headline: { type: String, trim: true },
  location: { type: String, trim: true },
  skills: { type: [String], default: [] },
  experience: { type: Number, default: 0, min: 0 },
  resumeUrl: { type: String },
  savedJobs: [{ type: Schema.Types.ObjectId, ref: "Job" }],
  appliedJobs: [{ type: Schema.Types.ObjectId, ref: "Job" }],
  profileCompletion: { type: Number, default: 0, min: 0, max: 100 },
});

export const Candidate = User.discriminator("candidate", CandidateSchema);