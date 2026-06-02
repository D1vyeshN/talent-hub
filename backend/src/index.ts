import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { connectDB } from "./config/database";
import { errorHandler } from "./middleware/error.middleware";
import { logger } from "./utils/logger";
import mongoose from "mongoose";

// Load env vars FIRST
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// ─── Middleware Chain ────────────────────────────────────────────────────────

// CORS
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);

// Body parsing
app.use(express.json({ limit: "10kb" })); // reject huge payloads
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Cookies
app.use(cookieParser());

// ─── Routes ───────────────────────────────────────────────────────────────────
import authRoutes from "@/features/auth/auth.routes";
app.use("/api/auth", authRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

// ─── Error Handler (must be last) ─────────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    logger.info(`🚀 Server running on http://localhost:${PORT}`);
    logger.info(`📋 Environment: ${process.env.NODE_ENV || "development"}`);
    logger.http("Health check → GET /api/health");
  });
};

startServer();

// ─── Graceful Shutdown ────────────────────────────────────────────────────────
process.on("SIGINT", async () => {
  logger.info("Shutting down gracefully...");
  await mongoose.disconnect();
  process.exit(0);
});

process.on("unhandledRejection", (err: Error) => {
  logger.error("Unhandled Promise Rejection", { error: err.message });
  process.exit(1);
});
