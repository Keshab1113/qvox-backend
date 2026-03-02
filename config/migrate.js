require("dotenv").config();
const pool = require("./db");

async function migrate() {
  const conn = await pool.getConnection();
  try {
    console.log("[Migrate] Running migrations...");

    // API Keys table
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS api_keys (
        id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        key_name      VARCHAR(100) NOT NULL COMMENT 'Human-readable label, e.g. website-prod',
        api_key       VARCHAR(128) NOT NULL UNIQUE,
        is_active     TINYINT(1) NOT NULL DEFAULT 1,
        created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_api_key (api_key),
        INDEX idx_is_active (is_active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // API call logs table
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS call_logs (
        id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        request_id      CHAR(36) NOT NULL UNIQUE COMMENT 'UUID per request',
        api_key_id      INT UNSIGNED NOT NULL,
        mode            ENUM('file','url') NOT NULL DEFAULT 'file' COMMENT 'file upload or URL mode',
        model           VARCHAR(50) NOT NULL DEFAULT 'QVox',
        source_url      TEXT NULL COMMENT 'URL if url-mode',
        filename        VARCHAR(255) NULL COMMENT 'Original filename if file-mode',
        file_size_bytes BIGINT UNSIGNED NULL,
        status          ENUM('pending','success','failed') NOT NULL DEFAULT 'pending',
        http_status     SMALLINT UNSIGNED NULL,
        output_text     MEDIUMTEXT NULL COMMENT 'Transcript text from model',
        output_segments JSON NULL COMMENT 'Segments array from model',
        error_message   TEXT NULL,
        duration_ms     INT UNSIGNED NULL COMMENT 'Total proxy round-trip time',
        ip_address      VARCHAR(45) NULL,
        user_agent      TEXT NULL,
        created_at      DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updated_at      DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        INDEX idx_api_key_id (api_key_id),
        INDEX idx_status (status),
        INDEX idx_created_at (created_at),
        INDEX idx_request_id (request_id),
        FOREIGN KEY (api_key_id) REFERENCES api_keys(id) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Daily stats (materialized summary — updated by flush job)
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS daily_stats (
        id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        stat_date     DATE NOT NULL,
        api_key_id    INT UNSIGNED NOT NULL,
        total_calls   INT UNSIGNED NOT NULL DEFAULT 0,
        success_calls INT UNSIGNED NOT NULL DEFAULT 0,
        failed_calls  INT UNSIGNED NOT NULL DEFAULT 0,
        avg_duration  FLOAT NULL,
        updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uq_date_key (stat_date, api_key_id),
        FOREIGN KEY (api_key_id) REFERENCES api_keys(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    console.log("[Migrate] ✅ All tables created/verified.");
  } finally {
    conn.release();
    await pool.end();
  }
}

migrate().catch((e) => {
  console.error("[Migrate] ❌ Failed:", e.message);
  process.exit(1);
});
