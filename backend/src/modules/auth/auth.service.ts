import { Types } from "mongoose";
import jwt, { JwtPayload } from "jsonwebtoken";
import { User, IUser } from "@/modules/users/user.model";
import { Candidate } from "@/modules/candidate/candidate.model";
import { Recruiter } from "@/modules/recruiter/recruiter.model";
import { Admin } from "@/modules/admin/admin.model";
import { ApiResponse } from "@/utils/ApiResponse";
import {
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  User as UserType,
  Candidate as CandidateType,
  Recruiter as RecruiterType,
  Admin as AdminType,
} from "@/shared/types/user";
import { AppError } from "@/middleware/error.middleware";
import { userService } from "@/modules/users/user.service";

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
function generateToken(userId: string, role: string, email?: string): string {
  return jwt.sign({ userId, role, email }, JWT_SECRET, { expiresIn: JWT_EXPIRE } as jwt.SignOptions);
}

/**
 * Convert a discriminator model document to API User shape
 */
function toApiUser(user: any): UserType {
  const base: UserType = {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    role: user.role as UserType["role"],
    createdAt: (user.createdAt as Date).toISOString(),
  };

  if (user.role === "candidate") {
    return {
      ...base,
      role: "candidate",
      headline: user.headline || "",
      location: user.location || "",
      skills: user.skills || [],
      experience: user.experience || 0,
      resumeUrl: user.resumeUrl || "",
      savedJobs: (user.savedJobs || []).map((id: any) => id.toString()),
      appliedJobs: (user.appliedJobs || []).map((id: any) => id.toString()),
      profileCompletion: user.profileCompletion || 0,
    } as CandidateType;
  }

  if (user.role === "recruiter") {
    return {
      ...base,
      role: "recruiter",
      company: user.company || "",
      companyId: user.companyId?.toString() || "",
      designation: user.designation || "",
      postedJobs: (user.postedJobs || []).map((id: any) => id.toString()),
    } as RecruiterType;
  }

  return {
    ...base,
    role: "admin",
    permissions: user.permissions || [],
  } as AdminType;
}

// ─── Service Functions ────────────────────────────────────────────────────────

export const authService = {
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const { name, email, password, role } = data;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      throw new AppError(409, "An account with this email already exists");
    }

    // Use the appropriate discriminator model based on role
    let userDoc: any;
    if (role === "candidate") {
      userDoc = await Candidate.create({ name, email, password, role });
    } else if (role === "recruiter") {
      userDoc = await Recruiter.create({ name, email, password, role });
    } else if (role === "admin") {
      userDoc = await Admin.create({ name, email, password, role });
    } else {
      userDoc = await User.create({ name, email, password, role });
    }

    const token = generateToken(userDoc._id.toString(), userDoc.role, userDoc.email);
    const apiUser = toApiUser(userDoc);

    return { user: apiUser, token };
  },

  async login(data: LoginRequest): Promise<AuthResponse> {
    const { email, password } = data;

    // Check if credentials match superadmin
    const superadminEmail = process.env.SUPERADMIN_EMAIL;
    const superadminPassword = process.env.SUPERADMIN_PASSWORD;

    if (superadminEmail && superadminPassword && email === superadminEmail && password === superadminPassword) {
      // Superadmin login - check if superadmin user exists in database
      let superadminUser = await User.findOne({ email: email.toLowerCase() });

      if (!superadminUser) {
        // Create superadmin user if it doesn't exist
        superadminUser = await Admin.create({
          name: "Superadmin",
          email: email.toLowerCase(),
          password: superadminPassword,
          role: "admin",
          permissions: ["manage_users", "manage_jobs", "manage_companies", "view_analytics", "import_mock_data", "clear_data"],
        });
      }

      const fullUserDoc = await Admin.findById(superadminUser._id);
      const token = generateToken(superadminUser._id.toString(), "admin", superadminUser.email);
      const apiUser = toApiUser(fullUserDoc);

      return { user: apiUser, token };
    }

    // Regular user login
    const userDoc = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!userDoc) {
      throw new AppError(401, "Invalid email or password");
    }

    const passwordMatches = await userDoc.comparePassword(password);
    if (!passwordMatches) {
      throw new AppError(401, "Invalid email or password");
    }

    // Fetch the full user document using the appropriate discriminator model
    let fullUserDoc: any;
    if (userDoc.role === "candidate") {
      fullUserDoc = await Candidate.findById(userDoc._id);
    } else if (userDoc.role === "recruiter") {
      fullUserDoc = await Recruiter.findById(userDoc._id);
    } else if (userDoc.role === "admin") {
      fullUserDoc = await Admin.findById(userDoc._id);
    } else {
      fullUserDoc = userDoc;
    }

    const token = generateToken(userDoc._id.toString(), userDoc.role, userDoc.email);
    const apiUser = toApiUser(fullUserDoc);

    return { user: apiUser, token };
  },

  async getMe(userId: string): Promise<UserType> {
    // First get the base user to determine role
    const baseUser = await User.findById(userId);
    if (!baseUser) {
      throw new AppError(404, "User not found");
    }

    // Fetch the full user document using the appropriate discriminator model
    let fullUserDoc: any;
    if (baseUser.role === "candidate") {
      fullUserDoc = await Candidate.findById(userId);
    } else if (baseUser.role === "recruiter") {
      fullUserDoc = await Recruiter.findById(userId).populate("companyId");
    } else if (baseUser.role === "admin") {
      fullUserDoc = await Admin.findById(userId);
    } else {
      fullUserDoc = baseUser;
    }

    if (!fullUserDoc) {
      throw new AppError(404, "User not found");
    }

    return toApiUser(fullUserDoc);
  },
};
