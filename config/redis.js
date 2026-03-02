const Redis = require("ioredis");

const redisConfig = {
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT) || 6379,
  db: parseInt(process.env.REDIS_DB) || 0,
  retryStrategy: (times) => Math.min(times * 100, 3000),
  enableReadyCheck: true,
  maxRetriesPerRequest: 3,
  lazyConnect: false,
};

if (process.env.REDIS_PASSWORD) {
  redisConfig.password = process.env.REDIS_PASSWORD;
}

const redis = new Redis(redisConfig);

redis.on("error", (err) => {
  console.error("[Redis] Error:", err.message);
});

redis.on("connect", () => {
  console.log("[Redis] Connected");
});

module.exports = redis;
