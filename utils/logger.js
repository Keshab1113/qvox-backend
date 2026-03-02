const winston = require("winston");
require("winston-daily-rotate-file");
const path = require("path");

const logDir = path.join(__dirname, "../../logs");

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.DailyRotateFile({
      dirname: logDir,
      filename: "app-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      maxFiles: "14d",
      zippedArchive: true,
    }),
    new winston.transports.DailyRotateFile({
      dirname: logDir,
      filename: "error-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      level: "error",
      maxFiles: "30d",
      zippedArchive: true,
    }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
} else {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.simple()
      ),
    })
  );
}

module.exports = logger;
