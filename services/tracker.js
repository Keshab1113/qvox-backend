const redis = require("../config/redis");
const logger = require("../utils/logger");
const { toMySQLDatetime } = require("../utils/dateFormatter");

const QUEUE_KEY = "qvox:call_log_queue";

/**
 * Push a log entry to Redis list (fire-and-forget, non-blocking).
 * The background flush job reads from this list and writes to MySQL.
 */
async function pushLog(entry) {
  try {
    await redis.rpush(QUEUE_KEY, JSON.stringify(entry));
  } catch (err) {
    // If Redis is down, log locally — don't crash the request
    logger.error("[Tracker] Failed to push log to Redis", { error: err.message, entry });
  }
}

/**
 * Call this immediately when a request arrives (before proxying).
 */
function buildPendingLog({ requestId, apiKeyId, mode, model, sourceUrl, filename, fileSizeBytes, ipAddress, userAgent }) {
  return {
    request_id: requestId,
    api_key_id: apiKeyId,
    mode,
    model: model || "QVox",
    source_url: sourceUrl || null,
    filename: filename || null,
    file_size_bytes: fileSizeBytes || null,
    status: "pending",
    http_status: null,
    output_text: null,
    output_segments: null,
    error_message: null,
    duration_ms: null,
    ip_address: ipAddress,
    user_agent: userAgent,
    created_at: toMySQLDatetime(), // Format: 2026-03-04 06:31:10
  };
}

/**
 * Call this after the proxy responds (success or failure).
 * Pushes an "update" marker that the flush job will apply.
 */
function buildResultLog({ requestId, status, httpStatus, outputText, outputSegments, errorMessage, durationMs }) {
  return {
    _type: "update",
    request_id: requestId,
    status,
    http_status: httpStatus,
    output_text: outputText || null,
    output_segments: outputSegments ? JSON.stringify(outputSegments) : null,
    error_message: errorMessage || null,
    duration_ms: durationMs,
  };
}

module.exports = { pushLog, buildPendingLog, buildResultLog };