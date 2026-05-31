import mongoose from "mongoose";
import { logger } from "../utils/logger";

export const connectDB = async (): Promise<void> => {
  try {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }

    await mongoose.connect(uri);

    logger.info("✅ MongoDB connected successfully", {
      host: mongoose.connection.host,
      name: mongoose.connection.name,
    });
  } catch (error) {
    logger.error("❌ MongoDB connection failed", { error });
    process.exit(1);
  }
};

// Log connection events
mongoose.connection.on("disconnected", () => {
  logger.warn("MongoDB disconnected — attempting reconnect...");
});

mongoose.connection.on("error", (err) => {
  logger.error("MongoDB connection error", { error: err });
});
