import { logger } from '@/utils/logger';
import { Request, Response, NextFunction } from 'express';

export const httpLoggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = process.hrtime();

  // Listen for the response finish event to log accurate status codes and timing
  res.on('finish', () => {
    const diff = process.hrtime(startTime);
    const timeInMs = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);
    
    const statusCode = res.statusCode;
    const message = `${req.method} ${req.originalUrl} - ${statusCode} (${timeInMs}ms)`;

    // Detailed metadata payload for Development environment
    const meta = {
      method: req.method,
      url: req.originalUrl,
      status: statusCode,
      duration: `${timeInMs}ms`,
      ip: req.ip,
      // Log request body if it exists, but skip empty objects
      body: Object.keys(req.body || {}).length ? req.body : undefined,
    };

    // Classify errors/warnings based on HTTP status codes
    if (statusCode >= 500) {
      logger.error(`Server Error: ${message}`, meta);
    } else if (statusCode >= 400) {
      logger.warn(`Client Error: ${message}`, meta);
    } else {
      logger.http(message, meta);
    }
  });

  next();
};
