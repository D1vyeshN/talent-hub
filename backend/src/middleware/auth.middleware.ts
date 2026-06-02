import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "./error.middleware";
import { logger } from "../utils/logger";

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
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
    };

    req.userId = payload.userId;
    req.userRole = payload.role;
    next();
  } catch (err) {
    logger.warn("JWT verification failed", { error: (err as Error).message });
    throw new AppError(401, "Invalid or expired token");
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
