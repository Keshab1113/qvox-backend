const redis = require("../config/redis");
const pool = require("../config/db");
const logger = require("../utils/logger");

const CACHE_TTL = 300; // 5 minutes
const CACHE_PREFIX = "apikey:";

/**
 * Validates the Bearer token against api_keys table.
 * Uses Redis as a fast cache to avoid DB hit on every request.
 * Attaches req.apiKey = { id, key_name, api_key } on success.
 */
async function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"] || req.headers["Authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Missing or invalid Authorization header. Use: Bearer <api_key>",
    });
  }

  const key = authHeader.slice(7).trim();

  if (!key || key.length < 10) {
    return res.status(401).json({ error: "Unauthorized", message: "Invalid API key format." });
  }

  try {
    // 1. Check Redis cache first (zero DB hit)
    const cacheKey = `${CACHE_PREFIX}${key}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      const keyData = JSON.parse(cached);
      if (!keyData.is_active) {
        return res.status(403).json({ error: "Forbidden", message: "API key is disabled." });
      }
      req.apiKey = keyData;
      return next();
    }

    // 2. Cache miss — query MySQL
    const [rows] = await pool.execute(
      "SELECT id, key_name, api_key, is_active FROM api_keys WHERE api_key = ? LIMIT 1",
      [key]
    );

    if (!rows.length) {
      // Cache negative result briefly to prevent DB hammering
      await redis.setex(cacheKey, 30, JSON.stringify({ is_active: false }));
      return res.status(401).json({ error: "Unauthorized", message: "API key not found." });
    }

    const keyData = rows[0];

    if (!keyData.is_active) {
      await redis.setex(cacheKey, 60, JSON.stringify(keyData));
      return res.status(403).json({ error: "Forbidden", message: "API key is disabled." });
    }

    // Cache valid key
    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(keyData));
    req.apiKey = keyData;
    return next();
  } catch (err) {
    logger.error("[Auth] Error validating API key", { error: err.message });

    // Fail open only if Redis fails but DB is reachable — already handled above
    // If DB also fails, reject safely
    return res.status(503).json({ error: "Service Unavailable", message: "Auth service error." });
  }
}

module.exports = authMiddleware;
