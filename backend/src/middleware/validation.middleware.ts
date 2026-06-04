import { ZodSchema } from "zod";
import { Request, Response, NextFunction } from "express";

export const validate =
  (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        data: null,
        message: result.error.issues[0]?.message,
        errors: result.error.issues,
      });
    }

    // Replace body with validated/transformed data
    req.body = result.data;

    next();
  };