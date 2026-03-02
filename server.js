require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const compression = require("compression");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const logger = require("./utils/logger");
const transcribeRouter = require("./routes/transcribe");
const adminRouter = require("./routes/admin");
const { startFlushJob, stopFlushJob } = require("./jobs/flushJob");

const app = express();
const PORT = parseInt(process.env.PORT) || 3000;

// ── Security & basics
app.set("trust proxy", 1);
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(",") : "*",
  methods: ["GET", "POST", "PATCH", "DELETE"],
}));
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false }));

// ── HTTP request logging
app.use(
  morgan("combined", {
    stream: { write: (msg) => logger.http(msg.trim()) },
  })
);

// ── Global rate limiter
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60_000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too Many Requests", message: "Slow down." },
});
app.use(limiter);

// ── Routes
app.use("/v1", transcribeRouter);
app.use("/admin", adminRouter);

// ── Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime(), ts: new Date().toISOString() });
});

// ── 404
app.use((req, res) => {
  res.status(404).json({ error: "Not Found KK gdfgdfg fdgfdg dfg" });
});

// ── Global error handler
app.use((err, req, res, _next) => {
  logger.error("[Server] Unhandled error", { error: err.message, stack: err.stack });
  res.status(500).json({ error: "Internal Server Error" });
});

// ── Start
const server = app.listen(PORT, () => {
  logger.info(`[Server] Listening on port ${PORT} (${process.env.NODE_ENV || "development"})`);
  startFlushJob();
});

// ── Graceful shutdown
async function shutdown(signal) {
  logger.info(`[Server] ${signal} received — shutting down gracefully`);
  server.close(async () => {
    await stopFlushJob();
    logger.info("[Server] Goodbye.");
    process.exit(0);
  });

  // Force exit after 15s
  setTimeout(() => {
    logger.warn("[Server] Forced exit after 15s");
    process.exit(1);
  }, 15_000);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("uncaughtException", (err) => {
  logger.error("[Server] uncaughtException", { error: err.message, stack: err.stack });
});
process.on("unhandledRejection", (reason) => {
  logger.error("[Server] unhandledRejection", { reason: String(reason) });
});

module.exports = app;
