import express from "express";
import http from "http";
import { Server } from "socket.io";
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
const PORT = Number(process.env.PORT) || 8080;

// ─── Middleware Chain ────────────────────────────────────────────────────────

// CORS
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  }),
);

// Body parsing
app.use(express.json({ limit: "10mb" })); // reject huge payloads
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Cookies
app.use(cookieParser());

// HTTP logger middleware
import { httpLoggerMiddleware } from "./middleware/httplogger.middleware";
app.use(httpLoggerMiddleware);

// ─── Routes ───────────────────────────────────────────────────────────────────
import authRoutes from "./modules/auth/auth.routes";
import usersRoutes from "./modules/users/user.routes";
import candidateRoutes from "./modules/candidate/candidate.routes";
import recruiterRoutes from "./modules/recruiter/recruiter.routes";
import companyRoutes from "./modules/company/company.routes";
import applicationRoutes from "./modules/application/application.routes";
import jobRoutes from "./modules/job/job.routes";
import messageRoutes from "./modules/message/message.routes";
import notificationRoutes from "./modules/notification/notification.routes";
import adminRoutes from "./modules/admin/admin.routes";
import uploadRoutes from "./modules/upload/upload.routes";
import { initSocket } from "./socket/socket";

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/candidate", candidateRoutes);
app.use("/api/recruiter", recruiterRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/application", applicationRoutes);
app.use("/api/job", jobRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/notification", notificationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/upload", uploadRoutes);



app.get("/api/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

// ─── Error Handler (must be last) ─────────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
const startServer = async () => {
  await connectDB();

  const httpServer = http.createServer(app);

  const io = new Server(httpServer, {
    cors: { origin: process.env.CLIENT_URL, credentials: true },
  });

  initSocket(io);

  app.listen(PORT, "0.0.0.0", () => {
    logger.info(`🚀 Server running on http://0.0.0.0:${PORT}`);
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
