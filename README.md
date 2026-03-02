# 🚀 QVox Tracking Backend

> Production-ready Node.js proxy & tracking backend for QVox transcription services.

A scalable, zero-delay logging system that securely routes transcription requests, authenticates multiple API keys, and stores detailed analytics using Redis + MySQL.

---

## ✨ Features

* 🔐 **Multi-API Key Authentication** (one key per website/client)
* 🔄 **Proxy to QVox ML Service** (File & URL mode)
* ⚡ **Zero Propagation Delay** using Redis write buffer
* 🗄️ **Persistent Logging** in MySQL
* 📊 **Admin Dashboard APIs** for usage stats
* 📈 Daily aggregated statistics per API key
* 🧠 Intelligent Redis → MySQL batch flushing
* 🛡️ Rate limiting, security headers, CORS control
* 📝 Structured logging with rotation (Winston)
* 🐳 Docker-ready setup

---

# 🏗 Architecture Overview

```
Your Websites
     │  Bearer <api_key>
     ▼
[Express Server :3000]
     │
     ├── Auth Middleware (Redis cache → MySQL fallback)
     │
     ├── pushLog(pending)  ──►  Redis Queue
     │                                     │
     ├── Proxy Request ──► QVox ML Model  │  Background Flush (5s batch)
     │                                     ▼
     └── pushLog(result)  ──►  MySQL (call_logs + daily_stats)
```

### 🔥 Why This Design?

* Request responses are **never blocked by database writes**
* Redis acts as a high-speed buffer
* Background job ensures reliable persistence
* Fully scalable architecture

---

# 🧰 Tech Stack

| Layer           | Technology                |
| --------------- | ------------------------- |
| Server          | Express                   |
| Database        | MySQL (mysql2)            |
| Cache/Queue     | Redis (ioredis)           |
| HTTP Client     | Axios                     |
| Auth            | Custom API Key Middleware |
| Logging         | Winston + Daily Rotate    |
| Security        | Helmet, CORS              |
| Rate Limiting   | express-rate-limit        |
| Compression     | compression               |
| Upload Handling | Multer + FormData         |
| Dev Tooling     | Nodemon                   |
| Utilities       | dotenv, uuid              |

---

# 🚀 Quick Start (Docker – Recommended)

```bash
cp .env.example .env
# Update environment variables

docker-compose up -d

# Run migrations
docker-compose exec app node src/config/migrate.js

# Seed initial API keys
docker-compose exec app node src/config/seed.js
```

---

# 🛠 Manual Setup

```bash
npm install

# 1. Configure .env
# 2. Run migrations
node src/config/migrate.js

# 3. Seed API keys
node src/config/seed.js

# 4. Start server
npm start
```

---

# 🌍 Environment Variables

| Variable          | Description          | Default                                                |
| ----------------- | -------------------- | ------------------------------------------------------ |
| PORT              | Server port          | 3000                                                   |
| DB_HOST           | MySQL host           | localhost                                              |
| DB_USER           | MySQL user           | root                                                   |
| DB_PASSWORD       | MySQL password       |                                                        |
| DB_NAME           | Database name        | qvox_tracking                                          |
| REDIS_HOST        | Redis host           | localhost                                              |
| REDIS_PORT        | Redis port           | 6379                                                   |
| QVOX_BASE_URL     | QVox API base URL    | [http://37.34.188.123:8000](http://37.34.188.123:8000) |
| QVOX_TOKEN        | QVox bearer token    | —                                                      |
| ADMIN_KEY         | Admin API key        | Required                                               |
| FLUSH_INTERVAL_MS | Redis flush interval | 5000                                                   |
| FLUSH_BATCH_SIZE  | Batch insert size    | 100                                                    |
| CORS_ORIGINS      | Allowed origins      | *                                                      |

---

# 📡 API Reference

## 🎙 Transcription Endpoint

### File Upload

```http
POST /v1/transcribe
Authorization: Bearer qvox_<your_api_key>
Content-Type: multipart/form-data

file: <audio file>
model: QVox
```

### URL Mode

```http
POST /v1/transcribe
Authorization: Bearer qvox_<your_api_key>
Content-Type: multipart/form-data

url: https://example.com/audio.mp3
model: QVox
```

### Response

```json
{
  "request_id": "uuid",
  "text": "Transcribed text...",
  "segments": [...]
}
```

---

# 🔐 Admin API

All admin routes require:

```
X-Admin-Key: <ADMIN_KEY>
```

### API Key Management

* `GET /admin/keys`
* `POST /admin/keys`
* `PATCH /admin/keys/:id`
* `DELETE /admin/keys/:id`

### Logs & Analytics

* `GET /admin/logs`
* `GET /admin/logs/:requestId`
* `GET /admin/stats`

Includes:

* Total calls
* Success / Failure breakdown
* API key usage distribution
* Daily summaries
* Redis queue depth

---

# 🗄 Database Schema

## `api_keys`

| Column    | Type    | Description        |
| --------- | ------- | ------------------ |
| id        | INT     | Primary key        |
| key_name  | VARCHAR | Label              |
| api_key   | VARCHAR | Bearer token       |
| is_active | TINYINT | Enabled / Disabled |

---

## `call_logs`

| Column          | Type        | Description                |
| --------------- | ----------- | -------------------------- |
| request_id      | CHAR(36)    | Unique ID                  |
| api_key_id      | INT         | API key used               |
| mode            | ENUM        | file / url                 |
| status          | ENUM        | pending / success / failed |
| http_status     | SMALLINT    | QVox status code           |
| output_text     | MEDIUMTEXT  | Transcript                 |
| output_segments | JSON        | Segment data               |
| duration_ms     | INT         | Processing time            |
| ip_address      | VARCHAR     | Caller IP                  |
| created_at      | DATETIME(3) | Timestamp                  |

---

## `daily_stats`

Materialized aggregated summary per API key.
Automatically updated during Redis → MySQL flush.

---

# 🔄 MERN Integration

Replace direct QVox calls:

```javascript
// Before
axios.post("http://37.34.188.123:8000/v1/transcribe", form)

// After
axios.post("https://your-backend.com/v1/transcribe", form, {
  headers: {
    Authorization: "Bearer qvox_<website_key>"
  }
})
```

---

# 📈 Why This Backend is Production-Ready

* Non-blocking logging architecture
* High-performance Redis buffering
* Batched MySQL writes
* API key-level analytics
* Secure admin access
* Rate limiting & security headers
* Log rotation & structured logging
* Docker-ready deployment

---

# 🛡 Security Considerations

* Change `ADMIN_KEY` immediately
* Restrict CORS in production
* Use strong API keys
* Enable Redis authentication in production
* Deploy behind reverse proxy (Nginx recommended)

---

# 📌 Future Enhancements

* Prometheus metrics integration
* Redis cluster mode
* Horizontal scaling with PM2 / Kubernetes
* Billing integration per API key
* Web dashboard UI

---

# 🧠 Summary

QVox Tracking Backend acts as a **secure, scalable control layer** between your websites and the QVox ML model — ensuring authentication, analytics, monitoring, and reliability without slowing down inference requests.

---
