const winston = require("winston");

// Simple console-only logger - no file creation
const logger = winston.createLogger({
  level: process.env.LOCAL_LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      return `${timestamp} [${level}]: ${message} ${
        Object.keys(meta).length ? JSON.stringify(meta) : ""
      }`;
    })
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

// Remove all file transports
logger.clear(); // Clear any default transports
logger.add(new winston.transports.Console()); // Add console transport

module.exports = logger;