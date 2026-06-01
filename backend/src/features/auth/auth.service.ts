import { Types } from "mongoose";
import jwt, { JwtPayload } from "jsonwebtoken";
import { User, IUser } from "./auth.model";
import { ApiResponse } from "@/utils/ApiResponse";
import {
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  User as UserType,
  Candidate,
  Recruiter,
  Admin,
} from "@/shared/types/user";
import { AppError } from "@/middleware/error.middleware";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const JWT_SECRET = (process.env.JWT_SECRET || "fallback-secret-change-me") as jwt.Secret;
const JWT_EXPIRE = process.env.JWT_EXPIRE || "7d";

/** Decode JWT payload — used in auth middleware at request time */
export function verifyToken(token: string): { userId: string; role: string } {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
  } catch {
    throw new AppError(401, "Invalid or expired token");
  }
}

/** Build a signed JWT */
function generateToken(userId: string, role: string): string {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: JWT_EXPIRE } as jwt.SignOptions);
}

/** Convert an IUser doc → API User shape (hides password, formats dates, stringifies _id) */
function toApiUser(user: IUser): UserType {
  const base: UserType = {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
  };

  if (user.avatar) base.avatar = user.avatar;

  if (user.role === "candidate") {
    return {
      ...base,
      role: "candidate",
      headline: user.headline,
      location: user.location,
      skills: user.skills,
      experience: user.experience,
      resumeUrl: user.resumeUrl,
      savedJobs: user.savedJobs,
      appliedJobs: user.appliedJobs,
      profileCompletion: user.profileCompletion,
    } as Candidate;
  }

  if (user.role === "recruiter") {
    return {
      ...base,
      role: "recruiter",
      company: user.company || "",
      companyId: user.companyId || "",
      designation: user.designation || "",
      postedJobs: user.postedJobs,
    } as Recruiter;
  }

  return {
    ...base,
    role: "admin",
    permissions: user.permissions,
  } as Admin;
}

// ─── Service Functions ────────────────────────────────────────────────────────

export const authService = {
  /**
   * Register a new user.
   * @throws AppError 409 if email already exists
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const { name, email, password, role } = data;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      throw new AppError(409, "An account with this email already exists");
    }

    const userDoc = await User.create({ name, email, password, role });
    const token = generateToken(userDoc._id.toString(), userDoc.role);

    return {
      user: toApiUser(userDoc),
      token,
    };
  },

  /**
   * Log in an existing user.
   * @throws AppError 401 if credentials don't match
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    const { email, password } = data;

    const userDoc = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!userDoc) {
      throw new AppError(401, "Invalid email or password");
    }

    const passwordMatches = await userDoc.comparePassword(password);
    if (!passwordMatches) {
      throw new AppError(401, "Invalid email or password");
    }

    const token = generateToken(userDoc._id.toString(), userDoc.role);

    return {
      user: toApiUser(userDoc),
      token,
    };
  },

  /**
   * Get the current authenticated user by ID.
   * @throws AppError 404 if user not found
   */
  async getMe(userId: string): Promise<UserType> {
    const userDoc = await User.findById(userId);
    if (!userDoc) {
      throw new AppError(404, "User not found");
    }
    return toApiUser(userDoc);
  },
};
