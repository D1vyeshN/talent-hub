import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { userService } from "./user.service";
import { ApiResponse } from "../../utils/ApiResponse";
import { AppError } from "../../middleware/error.middleware";
import { AuthRequest } from "../../middleware/auth.middleware";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-change-me";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function setTokenCookie(res: Response, token: string) {
  const isProduction = process.env.NODE_ENV === "production";
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "strict",
    secure: isProduction,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });
}

// ─── Controllers ──────────────────────────────────────────────────────────────

// export const register = async (req: Request, res: Response) => {
//   const { name, email, password, role } = req.body;
//   const user = await userService.create({ name, email, password, role });

//   const token = jwt.sign(
//     { userId: user._id?.toString(), role: user.role },
//     JWT_SECRET,
//     { expiresIn: "7d" }
//   );

//   setTokenCookie(res, token);

//   const fullUser = await userService.findById(user._id?.toString() as string);
//   res.status(201).json(new ApiResponse(201, fullUser, "Account created successfully"));
// };

// export const getMe = async (req: AuthRequest, res: Response) => {
//   if (!req.userId) {
//     throw new AppError(401, "Not authenticated");
//   }
//   const user = await userService.findById(req.userId);
//   res.status(200).json(new ApiResponse(200, user, "Session active"));
// };

export const getUsers = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 10;
  const search = req.query.search as string;
  const role = req.query.role as string;

  const result = await userService.getAllUsers({
    page,
    limit: pageSize,
    search,
    role: role as any,
  });

  res.status(200).json(new ApiResponse(200, result, "Users fetched successfully"));
};

export const updateMe = async (req: AuthRequest, res: Response) => {
  if (!req.userId) {
    throw new AppError(401, "Not authenticated");
  }
  const updated = await userService.updateProfile(
    req.userId,
    req.body,
  );
  res.status(200).json(new ApiResponse(200, updated, "Profile updated successfully"));
};

export const blockUser = async (req: AuthRequest, res: Response) => {
  const user = await userService.blockUser(
    req.params.userId as string,
  );
  res.status(200).json(new ApiResponse(200, user, "User blocked"));
};

export const unblockUser = async (req: AuthRequest, res: Response) => {
  const user = await userService.unblockUser(
    req.params.userId as string,
  );
  res.status(200).json(new ApiResponse(200, user, "User unblocked"));
};
