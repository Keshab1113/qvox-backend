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

const app = express();
const PORT = parseInt(process.env.PORT) || 3000;

console.log("🚀 Starting server...");
console.log("PORT:", PORT);
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("Database Host:", process.env.DB_HOST);
console.log("Database Name:", process.env.DB_NAME);

// ── Security & basics
app.set("trust proxy", 1);
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGINS
      ? process.env.CORS_ORIGINS.split(",")
      : "*",
    methods: ["GET", "POST", "PATCH", "DELETE"],
  }),
);
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false }));

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`\n📥 Incoming ${req.method} request to ${req.url}`);
  console.log("Headers:", {
    authorization: req.headers.authorization
      ? "Present (Bearer token)"
      : "Missing",
    "content-type": req.headers["content-type"],
  });
  next();
});

// ── HTTP request logging
app.use(
  morgan("combined", {
    stream: {
      write: (msg) => {
        logger.http(msg.trim());
        console.log("📝 Morgan log:", msg.trim());
      },
    },
  }),
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
console.log("📋 Registering routes...");
app.use("/v1", transcribeRouter);
app.use("/admin", adminRouter);
console.log("✅ Routes registered: /v1, /admin");

// ── Health check
app.get("/health", (req, res) => {
  console.log("✅ Health check requested");
  res.json({
    status: "ok",
    uptime: process.uptime(),
    ts: new Date().toISOString(),
  });
});

// ── 404
app.use((req, res) => {
  console.log("❌ 404 - Route not found:", req.url);
  res.status(404).json({ success: "Quantumhash Corporation" });
});

// ── Global error handler
app.use((err, req, res, _next) => {
  console.error("❌ Unhandled error:", err.message);
  console.error(err.stack);
  logger.error("[Server] Unhandled error", {
    error: err.message,
    stack: err.stack,
  });
  res.status(500).json({ error: "Internal Server Error" });
});

// ── Start
const server = app.listen(PORT, () => {
  console.log(`\n✅ Server is running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`📍 Transcribe endpoint: http://localhost:${PORT}/v1/transcribe`);
  console.log(`📍 Admin endpoint: http://localhost:${PORT}/admin/keys`);
  console.log("=====================================\n");
  logger.info(
    `[Server] Listening on port ${PORT} (${process.env.NODE_ENV || "development"})`,
  );
});

// ── Graceful shutdown
async function shutdown(signal) {
  console.log(`\n🛑 ${signal} received — shutting down gracefully`);
  logger.info(`[Server] ${signal} received — shutting down gracefully`);
  server.close(() => {
    console.log("👋 Server closed. Goodbye.");
    logger.info("[Server] Goodbye.");
    process.exit(0);
  });

  // Force exit after 15s
  setTimeout(() => {
    console.warn("⚠️ Forced exit after 15s");
    logger.warn("[Server] Forced exit after 15s");
    process.exit(1);
  }, 15_000);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("uncaughtException", (err) => {
  console.error("💥 uncaughtException:", err.message);
  console.error(err.stack);
  logger.error("[Server] uncaughtException", {
    error: err.message,
    stack: err.stack,
  });
});
process.on("unhandledRejection", (reason) => {
  console.error("💥 unhandledRejection:", reason);
  logger.error("[Server] unhandledRejection", { reason: String(reason) });
});

module.exports = app;
