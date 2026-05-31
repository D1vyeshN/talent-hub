type LogLevel = "info" | "warn" | "error" | "http";

const LEVEL_PREFIX: Record<LogLevel, string> = {
  info: "ℹ️",
  warn: "⚠️",
  error: "❌",
  http: "📡",
};

const timestamp = (): string =>
  new Date().toISOString().replace("T", " ").slice(0, 19);

/**
 * Simple structured console logger.
 * - Development: verbose with full metadata
 * - Production: concise (message only for info/http)
 */
const isDev = process.env.NODE_ENV !== "production";

function log(level: LogLevel, message: string, meta?: unknown) {
  const prefix = `${timestamp()} ${LEVEL_PREFIX[level]}`;
  if (level === "error") {
    console.error(prefix, message, meta ?? "");
  } else if (level === "warn") {
    console.warn(prefix, message, meta ?? "");
  } else if (level === "http" && isDev) {
    console.log(prefix, message, meta ?? "");
  } else if (level === "info" && isDev) {
    console.log(prefix, message, meta ?? "");
  } else if (level === "info") {
    console.log(prefix, message);
  }
}

export const logger = {
  info: (message: string, meta?: unknown) => log("info", message, meta),
  warn: (message: string, meta?: unknown) => log("warn", message, meta),
  error: (message: string, meta?: unknown) => log("error", message, meta),
  http: (message: string, meta?: unknown) => log("http", message, meta),
};
