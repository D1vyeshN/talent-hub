import { Types } from "mongoose";
import jwt, { JwtPayload } from "jsonwebtoken";
import { User, IUser } from "@/features/users/user.model";
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
import { userService } from "@/features/users/user.service";

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

// Profile fields live in CandidateProfile/RecruiterProfile (Phase C+).
// Cast to the extended interface so auth profiles aren't forced onto IUser.
interface UserWithProfile extends IUser {
  headline?: string;
  location?: string;
  skills?: string[];
  experience?: number;
  resumeUrl?: string;
  savedJobs?: string[];
  appliedJobs?: string[];
  profileCompletion?: number;
  company?: string;
  companyId?: string;
  designation?: string;
  postedJobs?: string[];
  permissions?: string[];
}

/**
 * Convert an IUser + optional profile into a full API User shape
 */
async function toApiUser(user: UserWithProfile): Promise<UserType> {
  const base: UserType = {
    id: user._id!.toString(),
    name: user.name,
    email: user.email,
    role: user.role as UserType["role"],
    createdAt: (user.createdAt as Date).toISOString(),
  };

  if (user.role === "candidate") {
    return {
      ...base,
      role: "candidate",
      headline: user.headline,
      location: user.location,
      skills: user.skills ?? [],
      experience: user.experience ?? 0,
      resumeUrl: user.resumeUrl,
      savedJobs: user.savedJobs ?? [],
      appliedJobs: user.appliedJobs ?? [],
      profileCompletion: user.profileCompletion ?? 0,
    } as Candidate;
  }

  if (user.role === "recruiter") {
    return {
      ...base,
      role: "recruiter",
      company: user.company ?? "",
      companyId: user.companyId ?? "",
      designation: user.designation ?? "",
      postedJobs: user.postedJobs ?? [],
    } as Recruiter;
  }

  return {
    ...base,
    role: "admin",
    permissions: user.permissions ?? [],
  } as Admin;
}

// ─── Service Functions ────────────────────────────────────────────────────────

export const authService = {
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const { name, email, password, role } = data;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      throw new AppError(409, "An account with this email already exists");
    }

    const userDoc = await User.create({ name, email, password, role });
    const token = generateToken(userDoc._id.toString(), userDoc.role);

    // Phase D: also create CandidateProfile / RecruiterProfile here.
    const apiUser = await toApiUser(userDoc as unknown as UserWithProfile);

    return { user: apiUser, token };
  },

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
    const apiUser = await toApiUser(userDoc as unknown as UserWithProfile);

    return { user: apiUser, token };
  },

  async getMe(userId: string): Promise<UserType> {
    const userDoc = await User.findById(userId);
    if (!userDoc) {
      throw new AppError(404, "User not found");
    }
    const baseUser = (await userService.getProfile(userId)) as unknown as UserWithProfile;
    return toApiUser(baseUser);
  },
};
