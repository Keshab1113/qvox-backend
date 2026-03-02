# QVox Tracking Backend

Production-ready Node.js proxy backend that:
- Routes all QVox transcription requests (file & URL mode)
- Authenticates requests via **multiple API keys** (one per website)
- Logs every call (status, output, duration, which key used) to **MySQL**
- Uses **Redis as a write buffer** — zero propagation delay on requests
- Background flush job drains Redis → MySQL every 5 seconds in batches
- Admin REST API for key management + stats

---

## Architecture

```
Your Websites
     │  Bearer <api_key>
     ▼
[Express Server :3000]
     │
     ├── Auth Middleware (validates key via Redis cache → MySQL fallback)
     │
     ├── pushLog(pending)  ──►  [Redis List: qvox:call_log_queue]
     │                                     │
     ├── Proxy ──► QVox ML Model           │  Background Flush Job (every 5s)
     │                                     ▼
     └── pushLog(result)  ──►  [MySQL: call_logs, daily_stats]
```

---

## Quick Start (Docker)

```bash
cp .env.example .env
# Edit .env with your real values

docker-compose up -d

# Run migrations + seed initial API keys
docker-compose exec app node src/config/migrate.js
docker-compose exec app node src/config/seed.js
```

---

## Manual Setup

```bash
npm install

# 1. Set up .env (copy from .env.example)
# 2. Run MySQL migrations
node src/config/migrate.js

# 3. Seed initial API keys (prints them to console)
node src/config/seed.js

# 4. Start server
npm start
```

---

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `PORT` | Server port | `3000` |
| `DB_HOST` | MySQL host | `localhost` |
| `DB_USER` | MySQL user | `root` |
| `DB_PASSWORD` | MySQL password | |
| `DB_NAME` | Database name | `qvox_tracking` |
| `REDIS_HOST` | Redis host | `localhost` |
| `REDIS_PORT` | Redis port | `6379` |
| `REDIS_PASSWORD` | Redis password | |
| `QVOX_BASE_URL` | QVox model URL | `http://37.34.188.123:8000` |
| `QVOX_TOKEN` | QVox bearer token | (from docs) |
| `ADMIN_KEY` | Admin API key | **Change this!** |
| `FLUSH_INTERVAL_MS` | How often to flush Redis→MySQL | `5000` |
| `FLUSH_BATCH_SIZE` | Max logs per flush | `100` |
| `CORS_ORIGINS` | Comma-separated allowed origins | `*` |

---

## API Reference

### Transcription (from your websites)

**File upload:**
```http
POST /v1/transcribe
Authorization: Bearer qvox_<your_api_key>
Content-Type: multipart/form-data

file: <audio file>
model: QVox
```

**URL mode:**
```http
POST /v1/transcribe
Authorization: Bearer qvox_<your_api_key>
Content-Type: multipart/form-data

url: https://example.com/audio.mp3
model: QVox
```

**Response:**
```json
{
  "request_id": "uuid",
  "text": "Transcribed text...",
  "segments": [...]
}
```

---

### Admin API

All admin routes require: `X-Admin-Key: <ADMIN_KEY>`

#### List API keys
```http
GET /admin/keys
```

#### Create API key
```http
POST /admin/keys
{ "key_name": "website-checkout" }
```

#### Enable/Disable key
```http
PATCH /admin/keys/:id
{ "is_active": false }
```

#### Delete key
```http
DELETE /admin/keys/:id
```

#### View call logs (paginated)
```http
GET /admin/logs?page=1&limit=20&status=failed&api_key_id=2&from=2024-01-01
```

#### View single log (full output)
```http
GET /admin/logs/:requestId
```

#### Stats dashboard
```http
GET /admin/stats
```
Returns overall stats, breakdown by API key, daily history, and Redis queue depth.

---

## MySQL Tables

### `api_keys`
| Column | Type | Description |
|---|---|---|
| id | INT | Primary key |
| key_name | VARCHAR | Label (e.g. "website-prod") |
| api_key | VARCHAR | The actual bearer token |
| is_active | TINYINT | 0 = disabled |

### `call_logs`
| Column | Type | Description |
|---|---|---|
| request_id | CHAR(36) | UUID per request |
| api_key_id | INT | Which key was used |
| mode | ENUM | `file` or `url` |
| status | ENUM | `pending` / `success` / `failed` |
| http_status | SMALLINT | HTTP status from QVox |
| output_text | MEDIUMTEXT | Full transcript |
| output_segments | JSON | Segments array |
| duration_ms | INT | Round-trip time in ms |
| ip_address | VARCHAR | Caller IP |
| created_at | DATETIME(3) | Millisecond precision |

### `daily_stats`
Materialized daily summary per API key — automatically updated by flush job.

---

## MERN Frontend Integration

Replace direct QVox calls with your backend:

```javascript
// Before
const response = await axios.post("http://37.34.188.123:8000/v1/transcribe", form, {
  headers: { Authorization: "Bearer zdbsjgu..." }
});

// After
const response = await axios.post("https://your-backend.com/v1/transcribe", form, {
  headers: { Authorization: "Bearer qvox_<website_specific_key>" }
});
```
