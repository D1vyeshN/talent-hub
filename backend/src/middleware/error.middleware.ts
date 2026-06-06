import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { ApiResponse } from "../utils/ApiResponse";
import { logger } from "../utils/logger";

/**
 * Global error handler — attach LAST in the middleware chain.
 *
 * Handles:
 * - Custom AppError (thrown with { statusCode, message })
 * - Mongoose ValidationError → 400
 * - Mongoose CastError → 400
 * - Mongoose duplicate key → 409
 * - JWT errors → 401
 * - Zod validation errors → 400 with details
 * - Everything else → 500
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
    const anyErr = err as any;
    message = Object.values(anyErr.errors || {}).map((e: any) => e.message).join(", ");
  }

  // Mongoose bad ID format
  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid ID format";
  }

  // Mongoose duplicate key (e.g. unique email)
  const anyErr = err as any;
  if (anyErr.code === 11000) {
    statusCode = 409;
    const field = Object.keys(anyErr.keyValue || {}).join(", ");
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

  // Zod validation errors
  if (err instanceof ZodError) {
    statusCode = 400;
    const errorDetails = err.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
      code: issue.code,
    }));
    message = "Validation failed";
    // Attach validation details to error for response
    (err as any).validationErrors = errorDetails;
  }

  // Log full error server-side, send safe message to client
  logger.error(`[${statusCode}] ${message}`, {
    error: err.stack,
    path: req.method + " " + req.path,
  });

  // Include validation errors if present
  const responseData = (err as any).validationErrors
    ? { validationErrors: (err as any).validationErrors }
    : null;

  res.status(statusCode).json(new ApiResponse(statusCode, responseData, message));
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
