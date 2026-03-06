const pool = require("../config/db");

/**
 * Validates the Bearer token against api_keys table.
 * Attaches req.apiKey = { id, key_name, api_key } on success.
 */
async function authMiddleware(req, res, next) {
  console.log("\n========== AUTH MIDDLEWARE ==========");
  console.log("Request URL:", req.originalUrl);
  console.log("Request Method:", req.method);
  
  const authHeader =
    req.headers["authorization"] || req.headers["Authorization"];

  console.log("Auth Header:", authHeader ? "Present" : "Missing");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("❌ Missing or invalid Authorization header format");
    return res.status(401).json({
      error: "Unauthorized",
      message: "Missing or invalid Authorization header. Use: Bearer <api_key>",
    });
  }

  const key = authHeader.slice(7).trim();
  console.log("API Key length:", key.length);

  if (!key || key.length < 10) {
    console.log("❌ API key too short or empty");
    return res
      .status(401)
      .json({ error: "Unauthorized", message: "Invalid API key format." });
  }

  try {
    console.log("🔍 Querying database for API key...");
    const [rows] = await pool.execute(
      "SELECT id, key_name, api_key, is_active FROM api_keys WHERE api_key = ? LIMIT 1",
      [key],
    );

    console.log("Database query result rows:", rows.length);

    if (!rows.length) {
      console.log("❌ No matching API key found in database");
      return res
        .status(401)
        .json({ error: "Unauthorized", message: "API key not found." });
    }

    const keyData = rows[0];

    if (!keyData.is_active) {
      console.log("❌ API key is disabled in database");
      return res
        .status(403)
        .json({ error: "Forbidden", message: "API key is disabled." });
    }

    console.log("✅ Authentication successful!");
    console.log("Attaching apiKey to request:", {
      id: keyData.id,
      key_name: keyData.key_name
    });
    
    req.apiKey = keyData;
    console.log("=====================================\n");
    return next();
  } catch (err) {
    console.error("❌ Database error during authentication:", err.message);
    console.error(err.stack);
    return res
      .status(503)
      .json({ error: "Service Unavailable", message: "Auth service error." });
  }
}

module.exports = authMiddleware;