import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

import { UserRoleValues, ALL_ROLES, type UserRole } from "./user.constants";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string; // select: false — never returned unless explicitly selected
  role: UserRole;
  isVerified: boolean;
  isBlocked: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },
    role: {
      type: String,
      enum: {
        values: ALL_ROLES,
        message: "Role must be one of: " + ALL_ROLES.join(", "),
      },
      required: true,
      default: "candidate",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

export const User = mongoose.model<IUser>("User", userSchema);
