import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../utils/ApiResponse";
import { logger } from "../utils/logger";

/**
 * Global error handler — attach LAST in the middleware chain.
 *
 * Handles:
 *  - Custom AppError (thrown with { statusCode, message })
 *  - Mongoose ValidationError  → 400
 *  - Mongoose CastError        → 400
 *  - Mongoose duplicate key    → 409
 *  - JWT errors                 → 401
 *  - Everything else            → 500
 */
export const errorHandler = (
  err: Error & { statusCode?: number; code?: string },
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Something went wrong";

  // Mongoose validation error (e.g. required fields)
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values((err as Record<string, unknown>).errors)
      .map((e: Record<string, unknown>) => e.message)
      .join(", ");
  }

  // Mongoose bad ID format
  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid ID format";
  }

  // Mongoose duplicate key (e.g. unique email)
  if ((err as Record<string, unknown>).code === 11000) {
    statusCode = 409;
    const field = Object.keys((err as Record<string, unknown>).keyValue || {}).join(", ");
    message = `${field} already exists`;
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  }
  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  }

  // Log full error server-side, send safe message to client
  logger.error(`[${statusCode}] ${message}`, {
    error: err.stack,
    path: req.method + " " + req.path,
  });

  res.status(statusCode).json(new ApiResponse(statusCode, null, message));
};

/**
 * Custom error class with statusCode — use instead of throwing plain Error.
 *
 * Example:
 *   throw new AppError(409, "Email already exists");
 */
export class AppError extends Error {
  public statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
