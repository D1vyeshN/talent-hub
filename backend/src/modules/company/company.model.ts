import mongoose, { Schema, Document } from "mongoose";
import { CompanySize } from "../../shared/types/index";

export interface ICompany extends Document {
  name: string;
  logo?: string;
  website?: string;
  industry: string;
  size: CompanySize;
  location: string;
  description?: string;
  foundedYear?: number;
  rating?: number;
  reviewsCount?: number;
  activeJobs?: number;
  verified: boolean;
  owner: mongoose.Types.ObjectId; // recruiter who created it
}

const CompanySchema = new Schema<ICompany>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    logo: { type: String },
    website: { type: String },
    industry: { type: String, required: true },
    size: {
      type: String,
      enum: ["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"],
      required: true,
    },
    location: { type: String, required: true },
    description: { type: String },
    foundedYear: { type: Number },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    reviewsCount: { type: Number, default: 0 },
    activeJobs: { type: Number, default: 0 },
    verified: { type: Boolean, default: false },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const Company = mongoose.model<ICompany>("Company", CompanySchema);