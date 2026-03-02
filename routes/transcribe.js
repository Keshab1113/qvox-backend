const express = require("express");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const router = express.Router();

const auth = require("../middleware/auth");
const { transcribeFile, transcribeUrl } = require("../services/qvoxProxy");
const { pushLog, buildPendingLog, buildResultLog } = require("../services/tracker");
const logger = require("../utils/logger");

// Keep file in memory (no disk write) — max 200MB
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 200 * 1024 * 1024 },
});

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

  // --- Fire-and-forget: log pending entry to Redis ---
  const pendingLog = buildPendingLog({
    requestId,
    apiKeyId: req.apiKey.id,
    mode,
    model,
    sourceUrl: isUrlMode ? req.body.url : null,
    filename: isFileMode ? req.file.originalname : null,
    fileSizeBytes: isFileMode ? req.file.size : null,
    ipAddress,
    userAgent,
  });
  pushLog(pendingLog); // non-blocking

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

    // Log success
    pushLog(
      buildResultLog({
        requestId,
        status: "success",
        httpStatus: proxyResponse.status,
        outputText: data?.text || null,
        outputSegments: data?.segments || null,
        errorMessage: null,
        durationMs,
      })
    );

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

    pushLog(
      buildResultLog({
        requestId,
        status: "failed",
        httpStatus,
        outputText: null,
        outputSegments: null,
        errorMessage,
        durationMs,
      })
    );

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

module.exports = router;
