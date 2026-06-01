import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

// ─── Interface ────────────────────────────────────────────────────────────────

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "candidate" | "recruiter" | "admin";
  avatar?: string;
  // Candidate fields
  headline?: string;
  location?: string;
  skills: string[];
  experience: number;
  resumeUrl?: string;
  savedJobs: string[];
  appliedJobs: string[];
  profileCompletion: number;
  // Recruiter fields
  company?: string;
  companyId?: string;
  designation?: string;
  postedJobs: string[];
  // Admin
  permissions?: string[];
  // Timestamps (Mongoose auto-manages these)
  createdAt: Date;
  updatedAt: Date;
  // Methods
  comparePassword(candidate: string): Promise<boolean>;
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    password: { type: String, required: true, minlength: 8, select: false },
    role: {
      type: String,
      enum: ["candidate", "recruiter", "admin"],
      default: "candidate",
      required: true,
    },
    avatar: { type: String },
    // Candidate-specific
    headline: { type: String, maxlength: 200 },
    location: { type: String },
    skills: [{ type: String }],
    experience: { type: Number, default: 0, min: 0 },
    resumeUrl: { type: String },
    savedJobs: [{ type: String }],
    appliedJobs: [{ type: String }],
    profileCompletion: { type: Number, default: 0, min: 0, max: 100 },
    // Recruiter-specific
    company: { type: String },
    companyId: { type: String },
    designation: { type: String },
    postedJobs: [{ type: String }],
    // Admin
    permissions: [{ type: String }],
  },
  { timestamps: true }
);

// ─── Indexes (email unique is auto-created from schema `unique: true`) ─────────

userSchema.index({ role: 1 });
userSchema.index({ companyId: 1 });

// ─── Instance Methods ─────────────────────────────────────────────────────────

userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// ─── Pre-save Hook ────────────────────────────────────────────────────────────

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ─── Export ───────────────────────────────────────────────────────────────────

export const User = mongoose.model<IUser>("User", userSchema);
