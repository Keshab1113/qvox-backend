const redis = require("../config/redis");
const pool = require("../config/db");
const logger = require("../utils/logger");

const QUEUE_KEY = "qvox:call_log_queue";
const BATCH_SIZE = parseInt(process.env.FLUSH_BATCH_SIZE) || 100;
const INTERVAL_MS = parseInt(process.env.FLUSH_INTERVAL_MS) || 5000;

let flushTimer = null;
let isFlushing = false;

async function flushBatch() {
  if (isFlushing) return;
  isFlushing = true;

  try {
    // Use a pipeline to pop up to BATCH_SIZE items atomically
    const pipeline = redis.pipeline();
    for (let i = 0; i < BATCH_SIZE; i++) {
      pipeline.lpop(QUEUE_KEY);
    }
    const results = await pipeline.exec();

    const items = results
      .map(([err, val]) => (err || !val ? null : JSON.parse(val)))
      .filter(Boolean);

    if (!items.length) return;

    const inserts = items.filter((i) => !i._type);
    const updates = items.filter((i) => i._type === "update");

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Batch INSERT pending logs
      if (inserts.length) {
        const values = inserts.map((i) => [
          i.request_id,
          i.api_key_id,
          i.mode,
          i.model,
          i.source_url,
          i.filename,
          i.file_size_bytes,
          i.status,
          i.http_status,
          i.output_text,
          i.output_segments,
          i.error_message,
          i.duration_ms,
          i.ip_address,
          i.user_agent,
          i.created_at,
        ]);

        await conn.query(
          `INSERT INTO call_logs
            (request_id, api_key_id, mode, model, source_url, filename, file_size_bytes,
             status, http_status, output_text, output_segments, error_message,
             duration_ms, ip_address, user_agent, created_at)
           VALUES ?
           ON DUPLICATE KEY UPDATE request_id = request_id`,
          [values]
        );
      }

      // Apply UPDATEs
      for (const u of updates) {
        await conn.execute(
          `UPDATE call_logs SET
             status = ?, http_status = ?, output_text = ?, output_segments = ?,
             error_message = ?, duration_ms = ?
           WHERE request_id = ?`,
          [
            u.status,
            u.http_status,
            u.output_text,
            u.output_segments,
            u.error_message,
            u.duration_ms,
            u.request_id,
          ]
        );
      }

      // Update daily_stats for each unique (date, api_key_id) in this batch
      const completedLogs = updates.filter((u) => u.status !== "pending");
      if (completedLogs.length) {
        // Get api_key_ids for completed requests
        const requestIds = completedLogs.map((u) => u.request_id);
        if (requestIds.length) {
          const placeholders = requestIds.map(() => "?").join(",");
          const [logRows] = await conn.execute(
            `SELECT api_key_id, DATE(created_at) as stat_date,
                    SUM(1) as total,
                    SUM(status='success') as success,
                    SUM(status='failed') as failed,
                    AVG(duration_ms) as avg_dur
             FROM call_logs
             WHERE request_id IN (${placeholders})
             GROUP BY api_key_id, DATE(created_at)`,
            requestIds
          );

          for (const row of logRows) {
            await conn.execute(
              `INSERT INTO daily_stats (stat_date, api_key_id, total_calls, success_calls, failed_calls, avg_duration)
               VALUES (?, ?, ?, ?, ?, ?)
               ON DUPLICATE KEY UPDATE
                 total_calls   = total_calls + VALUES(total_calls),
                 success_calls = success_calls + VALUES(success_calls),
                 failed_calls  = failed_calls + VALUES(failed_calls),
                 avg_duration  = ((avg_duration * (total_calls - VALUES(total_calls))) + (VALUES(avg_duration) * VALUES(total_calls))) / total_calls`,
              [row.stat_date, row.api_key_id, row.total, row.success, row.failed, row.avg_dur]
            );
          }
        }
      }

      await conn.commit();
      logger.debug(`[Flush] Flushed ${inserts.length} inserts, ${updates.length} updates`);
    } catch (err) {
      await conn.rollback();
      logger.error("[Flush] DB error, rolling back batch", { error: err.message });
      // Re-push failed items back to front of queue
      const pipeline2 = redis.pipeline();
      [...inserts, ...updates].forEach((i) =>
        pipeline2.lpush(QUEUE_KEY, JSON.stringify(i))
      );
      await pipeline2.exec();
    } finally {
      conn.release();
    }
  } catch (err) {
    logger.error("[Flush] Unexpected error", { error: err.message });
  } finally {
    isFlushing = false;
  }
}

function startFlushJob() {
  logger.info(`[Flush] Starting flush job every ${INTERVAL_MS}ms`);
  flushTimer = setInterval(flushBatch, INTERVAL_MS);
  // Run immediately on start
  flushBatch();
}

function stopFlushJob() {
  if (flushTimer) {
    clearInterval(flushTimer);
    flushTimer = null;
  }
  // Final flush on shutdown
  return flushBatch();
}

module.exports = { startFlushJob, stopFlushJob, flushBatch };
