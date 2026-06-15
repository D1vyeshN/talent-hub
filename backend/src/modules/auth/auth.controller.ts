import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { authService } from "./auth.service";
import { ApiResponse } from "../../utils/ApiResponse";
import { AuthRequest } from "../../middleware/auth.middleware";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function setTokenCookie(res: Response, token: string) {
  const isProduction = process.env.NODE_ENV === "production";
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "strict",
    secure: isProduction,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days — matches JWT_EXPIRE
    path: "/",
  });
}

// ─── Controllers ──────────────────────────────────────────────────────────────
// Note: no `return` before res.status().json() — asyncHandler expects Promise<void>
// Express sends the response as a side-effect; the function resolves to void.

export const register = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, email, password, role } = req.body;
    const result = await authService.register({ name, email, password, role });
    setTokenCookie(res, result.token);
    res.status(201).json(new ApiResponse(201, result, "Account created successfully"));
  }
);

export const login = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const result = await authService.login({ email, password });
    setTokenCookie(res, result.token);
    res.status(200).json(new ApiResponse(200, result, "Logged in successfully"));
  }
);

export const getMe = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = await authService.getMe(req.userId!);
    res.status(200).json(new ApiResponse(200, user, "Session active"));
  }
);

export const logout = asyncHandler(
  async (_req: Request, res: Response) => {
    res.clearCookie("token", { path: "/" });
    res.status(200).json(new ApiResponse(200, null, "Logged out successfully"));
  }
);
