import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "./error.middleware";
import { logger } from "../utils/logger";

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
  isSuperadmin?: boolean;
}

/**
 * Verifies JWT from Authorization: Bearer <token>
 * Attaches userId and userRole to req.
 */
export const authenticate = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  // const authHeader = req.headers.authorization;

  // if (!authHeader?.startsWith("Bearer ")) {
  //   throw new AppError(401, "Unauthorized — no token provided");
  // }

  // const token = authHeader.split(" ")[1];
  const token = req.cookies.token;

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      role: string;
      email?: string;
    };

    req.userId = payload.userId;
    req.userRole = payload.role;

    // Check if user is superadmin based on credentials
    const superadminEmail = process.env.SUPERADMIN_EMAIL;
    const superadminPassword = process.env.SUPERADMIN_PASSWORD;

    if (superadminEmail && superadminPassword && payload.email === superadminEmail) {
      req.isSuperadmin = true;
      // Grant admin privileges regardless of actual role
      req.userRole = "admin";
    }

    next();
  } catch (err) {
    logger.warn("JWT verification failed", { error: (err as Error).message });
    throw new AppError(401, "Invalid or expired token");
  }
};

/**
 * Optional authentication - allows requests without token but attaches user info if token is valid
 * Used for public routes that can show recruiter-specific data when logged in
 */
export const optionalAuth = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  const token = req.cookies.token;

  if (!token) {
    // No token provided, proceed without auth
    return next();
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      role: string;
      email?: string;
    };

    if (payload.role === "candidate") {
      return next();
    }

    req.userId = payload.userId;
    req.userRole = payload.role;


    // Check if user is superadmin based on credentials
    const superadminEmail = process.env.SUPERADMIN_EMAIL;
    const superadminPassword = process.env.SUPERADMIN_PASSWORD;

    if (superadminEmail && superadminPassword && payload.email === superadminEmail) {
      req.isSuperadmin = true;
      req.userRole = "admin";
    }

    next();
  } catch (err) {
    // Invalid token, but proceed without auth for optional routes
    logger.warn("Optional auth failed, proceeding without auth", { error: (err as Error).message });
    next();
  }
};

/**
 * Allows only the specified roles.
 * Must be used AFTER authenticate.
 *
 * Example:
 *   router.get("/jobs", authenticate, authorize("recruiter", "admin"), jobController.getMyJobs);
 */
export const authorize =
  (...allowedRoles: string[]) =>
    (req: AuthRequest, _res: Response, next: NextFunction) => {
      if (!req.userRole) {
        throw new AppError(401, "Unauthorized");
      }

      if (!allowedRoles.includes(req.userRole)) {
        throw new AppError(403, "Forbidden — insufficient permissions");
      }

      next();
    };
