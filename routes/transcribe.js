const express = require("express");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const router = express.Router();

const auth = require("../middleware/auth");
const { transcribeFile, transcribeUrl } = require("../services/qvoxProxy");
const pool = require("../config/db");
const logger = require("../utils/logger");
const { toMySQLDatetime } = require("../utils/dateFormatter");

// Keep file in memory (no disk write) — max 200MB
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 200 * 1024 * 1024 },
});

async function insertLog(logData) {
  try {
    await pool.execute(
      `INSERT INTO call_logs
        (request_id, api_key_id, mode, model, source_url, filename, file_size_bytes,
         status, http_status, output_text, output_segments, error_message,
         duration_ms, ip_address, user_agent, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        logData.request_id,
        logData.api_key_id,
        logData.mode,
        logData.model,
        logData.source_url,
        logData.filename,
        logData.file_size_bytes,
        logData.status,
        logData.http_status,
        logData.output_text,
        logData.output_segments,
        logData.error_message,
        logData.duration_ms,
        logData.ip_address,
        logData.user_agent,
        logData.created_at,
      ]
    );
  } catch (err) {
    logger.error("[Tracker] Failed to insert log", { error: err.message, logData });
  }
}

router.post("/transcribe", auth, upload.single("file"), async (req, res) => {
  const requestId = uuidv4();
  const startTime = Date.now();
  const ipAddress =
    req.headers["x-forwarded-for"]?.split(",")[0].trim() || req.socket.remoteAddress;
  const userAgent = req.headers["user-agent"] || null;
  const model = req.body?.model || "QVox";

  const isFileMode = !!req.file;
  const isUrlMode = !!(req.body?.url);

  if (!isFileMode && !isUrlMode) {
    return res.status(400).json({
      error: "Bad Request",
      message: "Provide either a 'file' or a 'url' field.",
    });
  }

  const mode = isFileMode ? "file" : "url";

  // Insert pending log
  const pendingLog = {
    request_id: requestId,
    api_key_id: req.apiKey.id,
    mode,
    model: model || "QVox",
    source_url: isUrlMode ? req.body.url : null,
    filename: isFileMode ? req.file.originalname : null,
    file_size_bytes: isFileMode ? req.file.size : null,
    status: "pending",
    http_status: null,
    output_text: null,
    output_segments: null,
    error_message: null,
    duration_ms: null,
    ip_address: ipAddress,
    user_agent: userAgent,
    created_at: toMySQLDatetime(),
  };
  
  // Don't await - fire and forget
  insertLog(pendingLog).catch(err => 
    logger.error("[Transcribe] Failed to insert pending log", { error: err.message, requestId })
  );

  try {
    let proxyResponse;

    if (isFileMode) {
      proxyResponse = await transcribeFile({
        fileBuffer: req.file.buffer,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        model,
      });
    } else {
      proxyResponse = await transcribeUrl({ url: req.body.url, model });
    }

    const durationMs = Date.now() - startTime;
    const data = proxyResponse.data;

    // Update log with success
    const successLog = {
      request_id: requestId,
      status: "success",
      http_status: proxyResponse.status,
      output_text: data?.text || null,
      output_segments: data?.segments ? JSON.stringify(data.segments) : null,
      error_message: null,
      duration_ms: durationMs,
    };

    await pool.execute(
      `UPDATE call_logs SET
         status = ?, http_status = ?, output_text = ?, output_segments = ?,
         error_message = ?, duration_ms = ?
       WHERE request_id = ?`,
      [
        successLog.status,
        successLog.http_status,
        successLog.output_text,
        successLog.output_segments,
        successLog.error_message,
        successLog.duration_ms,
        successLog.request_id,
      ]
    );

    // Update daily stats
    await updateDailyStats(req.apiKey.id, pendingLog.created_at.split(' ')[0], "success", durationMs);

    logger.info("[Transcribe] Success", {
      requestId,
      apiKeyName: req.apiKey.key_name,
      mode,
      durationMs,
    });

    return res.status(200).json({
      request_id: requestId,
      ...data,
    });
  } catch (err) {
    const durationMs = Date.now() - startTime;
    const httpStatus = err.response?.status || 502;
    const errorMessage = err.response?.data
      ? JSON.stringify(err.response.data)
      : err.message;

    // Update log with failure
    await pool.execute(
      `UPDATE call_logs SET
         status = ?, http_status = ?, error_message = ?, duration_ms = ?
       WHERE request_id = ?`,
      [
        "failed",
        httpStatus,
        errorMessage,
        durationMs,
        requestId,
      ]
    );

    // Update daily stats
    await updateDailyStats(req.apiKey.id, pendingLog.created_at.split(' ')[0], "failed", durationMs);

    logger.error("[Transcribe] Failed", {
      requestId,
      apiKeyName: req.apiKey.key_name,
      mode,
      httpStatus,
      error: errorMessage,
    });

    return res.status(httpStatus).json({
      error: "Proxy Error",
      request_id: requestId,
      message: err.response?.data || "Failed to reach QVox model.",
    });
  }
});

async function updateDailyStats(apiKeyId, statDate, status, durationMs) {
  try {
    // Check if record exists
    const [existing] = await pool.execute(
      "SELECT * FROM daily_stats WHERE api_key_id = ? AND stat_date = ?",
      [apiKeyId, statDate]
    );

    if (existing.length === 0) {
      // Insert new record
      await pool.execute(
        `INSERT INTO daily_stats (stat_date, api_key_id, total_calls, success_calls, failed_calls, avg_duration)
         VALUES (?, ?, 1, ?, ?, ?)`,
        [
          statDate,
          apiKeyId,
          status === "success" ? 1 : 0,
          status === "failed" ? 1 : 0,
          durationMs
        ]
      );
    } else {
      // Update existing record
      const successInc = status === "success" ? 1 : 0;
      const failedInc = status === "failed" ? 1 : 0;
      
      await pool.execute(
        `UPDATE daily_stats SET
           total_calls = total_calls + 1,
           success_calls = success_calls + ?,
           failed_calls = failed_calls + ?,
           avg_duration = ((avg_duration * total_calls) + ?) / (total_calls + 1)
         WHERE api_key_id = ? AND stat_date = ?`,
        [successInc, failedInc, durationMs, apiKeyId, statDate]
      );
    }
  } catch (err) {
    logger.error("[Stats] Failed to update daily stats", { error: err.message, apiKeyId, statDate });
  }
}

module.exports = router;