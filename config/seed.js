require("dotenv").config();
const pool = require("./db");
const { v4: uuidv4 } = require("uuid");

const INITIAL_KEYS = [
  { name: "website-main", key: `qvox_${uuidv4().replace(/-/g, "")}` },
  { name: "website-mobile", key: `qvox_${uuidv4().replace(/-/g, "")}` },
  { name: "website-admin", key: `qvox_${uuidv4().replace(/-/g, "")}` },
];

async function seed() {
  const conn = await pool.getConnection();
  try {
    for (const k of INITIAL_KEYS) {
      await conn.execute(
        "INSERT IGNORE INTO api_keys (key_name, api_key) VALUES (?, ?)",
        [k.name, k.key]
      );
      console.log(`[Seed] Created key [${k.name}]: ${k.key}`);
    }
    console.log("[Seed] ✅ Done. Copy the keys above and distribute to your websites.");
  } finally {
    conn.release();
    await pool.end();
  }
}

seed().catch((e) => {
  console.error("[Seed] ❌ Failed:", e.message);
  process.exit(1);
});
