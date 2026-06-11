import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";

/**
 * Validate notification ID parameter
 */
export const validateNotificationId = (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  if (!Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, statusCode: 400, data: null, message: "Invalid notification ID" });
  }
  next();
};

/**
 * Validate notification creation data (used internally)
 * Currently no validation needed as data comes from trusted services
 */
export const validateNotificationData = (req: Request, res: Response, next: NextFunction) => {
  next();
};