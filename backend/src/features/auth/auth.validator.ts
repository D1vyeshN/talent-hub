import { Request, Response, NextFunction } from "express";
import { RegisterRequest, LoginRequest } from "@/shared/types/user";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const emailRegex = /^\S+@\S+\.\S+$/;

// ─── Validators (call next() or send response directly — no asyncHandler needed) ─

export const registerValidation = (req: Request, res: Response, next: NextFunction) => {
  const body = req.body as Partial<RegisterRequest>;

  if (!body.name || body.name.trim().length < 2) {
    return res.status(400).json({
      success: false,
      statusCode: 400,
      data: null,
      message: "Name must be at least 2 characters",
    });
  }

  if (!body.email || !emailRegex.test(body.email)) {
    return res.status(400).json({
      success: false,
      statusCode: 400,
      data: null,
      message: "Please enter a valid email address",
    });
  }

  if (!body.password || body.password.length < 8) {
    return res.status(400).json({
      success: false,
      statusCode: 400,
      data: null,
      message: "Password must be at least 8 characters",
    });
  }

  const allowedRoles = ["candidate", "recruiter"];
  if (!body.role || !allowedRoles.includes(body.role)) {
    return res.status(400).json({
      success: false,
      statusCode: 400,
      data: null,
      message: "Role must be either 'candidate' or 'recruiter'",
    });
  }

  next();
};

export const loginValidation = (req: Request, res: Response, next: NextFunction) => {
  const body = req.body as Partial<LoginRequest>;

  if (!body.email || !emailRegex.test(body.email)) {
    return res.status(400).json({
      success: false,
      statusCode: 400,
      data: null,
      message: "Please enter a valid email address",
    });
  }

  if (!body.password) {
    return res.status(400).json({
      success: false,
      statusCode: 400,
      data: null,
      message: "Password is required",
    });
  }

  next();
};
