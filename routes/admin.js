const express = require("express");
const { v4: uuidv4 } = require("uuid");
const pool = require("../config/db");
const router = express.Router();

function adminAuth(req, res, next) {
  console.log("\n🔐 Admin Auth Check");
  const key = req.headers["x-admin-key"];
  console.log("Admin key provided:", key ? "Yes" : "No");
  
  if (!key || key !== process.env.ADMIN_KEY) {
    console.log("❌ Admin auth failed");
    return res.status(403).json({ error: "Forbidden" });
  }
  console.log("✅ Admin auth successful");
  next();
}

router.use(adminAuth);

// ── GET /admin/keys — list all API keys
router.get("/keys", async (req, res) => {
  console.log("\n📋 GET /admin/keys - Fetching all keys");
  try {
    const [rows] = await pool.execute(
      "SELECT id, key_name, api_key, is_active, created_at FROM api_keys ORDER BY created_at DESC"
    );
    console.log(`✅ Found ${rows.length} keys`);
    res.json({ keys: rows });
  } catch (err) {
    console.error("❌ Error fetching keys:", err.message);
    res.status(500).json({ error: "Database error" });
  }
});

// ── POST /admin/keys — create new API key
router.post("/keys", async (req, res) => {
  console.log("\n➕ POST /admin/keys - Creating new key");
  console.log("Request body:", req.body);
  
  const { key_name } = req.body;
  if (!key_name) {
    console.log("❌ Missing key_name");
    return res.status(400).json({ error: "key_name is required" });
  }

  const apiKey = `qvox_${uuidv4().replace(/-/g, "")}`;
  console.log("Generated API key:", apiKey);
  
  try {
    await pool.execute("INSERT INTO api_keys (key_name, api_key) VALUES (?, ?)", [
      key_name,
      apiKey,
    ]);
    console.log("✅ Key created successfully");
    res.status(201).json({ key_name, api_key: apiKey });
  } catch (err) {
    console.error("❌ Error creating key:", err.message);
    res.status(500).json({ error: "Database error" });
  }
});

// ── PATCH /admin/keys/:id — enable/disable a key
router.patch("/keys/:id", async (req, res) => {
  console.log(`\n✏️ PATCH /admin/keys/${req.params.id} - Updating key`);
  console.log("Request body:", req.body);
  
  const { is_active } = req.body;
  if (typeof is_active === "undefined") {
    console.log("❌ Missing is_active");
    return res.status(400).json({ error: "is_active required" });
  }

  try {
    const [result] = await pool.execute(
      "UPDATE api_keys SET is_active = ? WHERE id = ?",
      [is_active ? 1 : 0, req.params.id]
    );

    console.log("Update result:", result);
    
    if (!result.affectedRows) {
      console.log("❌ Key not found");
      return res.status(404).json({ error: "Key not found" });
    }

    console.log("✅ Key updated successfully");
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Error updating key:", err.message);
    res.status(500).json({ error: "Database error" });
  }
});

// ── DELETE /admin/keys/:id — delete a key
router.delete("/keys/:id", async (req, res) => {
  console.log(`\n🗑️ DELETE /admin/keys/${req.params.id} - Deleting key`);
  
  try {
    const [rows] = await pool.execute(
      "SELECT api_key FROM api_keys WHERE id = ?",
      [req.params.id]
    );
    
    if (!rows.length) {
      console.log("❌ Key not found");
      return res.status(404).json({ error: "Key not found" });
    }

    await pool.execute("DELETE FROM api_keys WHERE id = ?", [req.params.id]);
    console.log("✅ Key deleted successfully");
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Error deleting key:", err.message);
    res.status(500).json({ error: "Database error" });
  }
});

// ── GET /admin/logs — paginated call logs with filters
router.get("/logs", async (req, res) => {
  console.log("\n📋 GET /admin/logs - Fetching logs");
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, parseInt(req.query.limit) || 20);
  const offset = (page - 1) * limit;

  const filters = [];
  const params = [];

  if (req.query.api_key_id) {
    filters.push("cl.api_key_id = ?");
    params.push(req.query.api_key_id);
  }
  if (req.query.status) {
    filters.push("cl.status = ?");
    params.push(req.query.status);
  }
  if (req.query.mode) {
    filters.push("cl.mode = ?");
    params.push(req.query.mode);
  }
  if (req.query.from) {
    filters.push("cl.created_at >= ?");
    params.push(req.query.from);
  }
  if (req.query.to) {
    filters.push("cl.created_at <= ?");
    params.push(req.query.to);
  }

  const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

  const [[{ total }]] = await pool.execute(
    `SELECT COUNT(*) as total FROM call_logs cl ${where}`,
    params
  );

  const [rows] = await pool.execute(
    `SELECT cl.id, cl.request_id, ak.key_name, cl.mode, cl.model,
            cl.filename, cl.source_url, cl.file_size_bytes,
            cl.status, cl.http_status, cl.duration_ms,
            cl.output_text, cl.error_message, cl.ip_address, cl.created_at
     FROM call_logs cl
     JOIN api_keys ak ON ak.id = cl.api_key_id
     ${where}
     ORDER BY cl.created_at DESC
     LIMIT ${limit} OFFSET ${offset}`,
    params
  );

  res.json({
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
    logs: rows,
  });
});

// ── GET /admin/logs/:requestId — single log with full output
router.get("/logs/:requestId", async (req, res) => {
  console.log(`\n📋 GET /admin/logs/${req.params.requestId} - Fetching single log`);
  const [rows] = await pool.execute(
    `SELECT cl.*, ak.key_name
     FROM call_logs cl
     JOIN api_keys ak ON ak.id = cl.api_key_id
     WHERE cl.request_id = ?`,
    [req.params.requestId]
  );
  if (!rows.length) return res.status(404).json({ error: "Not found" });
  res.json(rows[0]);
});

// ── GET /admin/stats — summary stats
router.get("/stats", async (req, res) => {
  console.log("\n📊 GET /admin/stats - Fetching stats");
  const [overall] = await pool.execute(`
    SELECT
      COUNT(*) as total_calls,
      SUM(status='success') as success_calls,
      SUM(status='failed') as failed_calls,
      SUM(status='pending') as pending_calls,
      AVG(duration_ms) as avg_duration_ms,
      MIN(created_at) as first_call,
      MAX(created_at) as last_call
    FROM call_logs
  `);

  const [byKey] = await pool.execute(`
    SELECT ak.id, ak.key_name, ak.is_active,
           COUNT(cl.id) as total_calls,
           SUM(cl.status='success') as success_calls,
           SUM(cl.status='failed') as failed_calls,
           AVG(cl.duration_ms) as avg_duration_ms
    FROM api_keys ak
    LEFT JOIN call_logs cl ON cl.api_key_id = ak.id
    GROUP BY ak.id
    ORDER BY total_calls DESC
  `);

  const [daily] = await pool.execute(`
    SELECT stat_date, ak.key_name, ds.total_calls, ds.success_calls,
           ds.failed_calls, ds.avg_duration
    FROM daily_stats ds
    JOIN api_keys ak ON ak.id = ds.api_key_id
    ORDER BY stat_date DESC
    LIMIT 90
  `);

  res.json({
    overall: overall[0],
    by_api_key: byKey,
    daily
  });
});

module.exports = router;