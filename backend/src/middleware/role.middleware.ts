import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";
import { ApiError } from "../utils/ApiError";
import { UserRole } from "../shared/types/user";

export const authorizeRoles =
  (...roles: UserRole[]) =>
  (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!roles.includes(req.userRole as UserRole)) {
      return next(
        new ApiError(403, `Forbidden: Requires role(s) — ${roles.join(", ")}`)
      );
    }
    next();
  };