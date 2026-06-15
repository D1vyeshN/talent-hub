import { AppError } from "../../middleware/error.middleware";
import { User } from "./user.model";
import type { CreateUserDto, UpdateUserDto, UserFilterDto, IUser } from "./user.types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Assemble a full user profile response by joining User + profile collection.
 * Called after a User doc is fetched. Returns the enriched shape that the
 * frontend expects (Candidate | Recruiter | Admin).
 *
 * Profile services will be wired here in Phase D/E.
 */

async function enrichWithProfile(user: IUser): Promise<IUser> {
  // For now return the raw IUser (no profile data yet).
  // ── Phase D: import candidateProfile.service.getByUserId() and recruiter.service.getByUserId()
  // ── Merge profile fields into response based on user.role.
  return user;
}

// ─── Service Functions ────────────────────────────────────────────────────────

export const userService = {
  /**
   * Create a new user.
   * @throws AppError 409 if email already exists.
   */
  async create(dto: CreateUserDto): Promise<IUser> {
    const existing = await User.findOne({ email: dto.email.toLowerCase() });
    if (existing) {
      throw new AppError(409, "An account with this email already exists");
    }
    const user = await User.create({
      name: dto.name,
      email: dto.email,
      password: dto.password,
      role: dto.role,
    });
    return user;
  },

  /**
   * Find user by email WITH password selected.
   * Used by auth login — must .select("+password") since default excludes it.
   */
  async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email: email.toLowerCase() }).select("+password") as Promise<IUser | null>;
  },

  /**
   * Find user by ID (without password).
   * Throws AppError 404 if not found.
   */
  async findById(userId: string): Promise<IUser> {
    const user = (await User.findById(userId).select("-password")) as IUser | null;
    if (!user) {
      throw new AppError(404, "User not found");
    }
    return user;
  },

  /**
   * Get the current user's profile — assembles User + profile collection.
   */
  async getProfile(userId: string): Promise<IUser> {
    const user = await userService.findById(userId);
    return enrichWithProfile(user);
  },

  /**
   * Update basic User fields (name, email).
   * Profile-specific fields are delegated to the profile service in Phase E.
   */
  async updateProfile(userId: string, dto: UpdateUserDto): Promise<IUser> {
    const allowed: Record<string, unknown> = {};
    if (dto.name !== undefined) allowed.name = dto.name;
    if (dto.email !== undefined) allowed.email = dto.email.toLowerCase();

    const user = (await User.findByIdAndUpdate(
      userId,
      allowed,
      { new: true, runValidators: true }
    ).select("-password")) as IUser | null;

    if (!user) {
      throw new AppError(404, "User not found");
    }
    return user;
  },

  /**
   * List all users — optionally filtered with pagination.
   */
  async getAllUsers(filter?: UserFilterDto): Promise<{ data: IUser[]; total: number }> {
    const query: Record<string, unknown> = {};

    if (filter?.role) query.role = filter.role;
    if (filter?.isBlocked !== undefined) query.isBlocked = filter.isBlocked;
    if (filter?.isVerified !== undefined) query.isVerified = filter.isVerified;

    if (filter?.search) {
      query.$or = [
        { name: { $regex: filter.search, $options: "i" } },
        { email: { $regex: filter.search, $options: "i" } },
      ];
    }

    const page = filter?.page || 1;
    const limit = filter?.limit || 10;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      User.find(query).skip(skip).limit(limit) as unknown as Promise<IUser[]>,
      User.countDocuments(query)
    ]);

    return { data, total };
  },

  /**
   * Block a user.
   */
  async blockUser(userId: string): Promise<IUser> {
    const user = (await User.findByIdAndUpdate(
      userId,
      { isBlocked: true },
      { new: true }
    ).select("-password")) as IUser | null;

    if (!user) {
      throw new AppError(404, "User not found");
    }
    return user;
  },

  /**
   * Unblock a user.
   */
  async unblockUser(userId: string): Promise<IUser> {
    const user = (await User.findByIdAndUpdate(
      userId,
      { isBlocked: false },
      { new: true }
    ).select("-password")) as IUser | null;

    if (!user) {
      throw new AppError(404, "User not found");
    }
    return user;
  },
};
