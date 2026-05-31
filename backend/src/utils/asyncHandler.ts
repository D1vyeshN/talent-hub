import { Request, Response, NextFunction } from "express";

/**
 * Wraps an async controller so you never need try/catch inside it.
 * Any thrown error is forwarded to the global error middleware.
 */
export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
