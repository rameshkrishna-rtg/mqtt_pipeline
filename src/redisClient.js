const Redis = require("ioredis");
const config = require("./config");


const redis = new Redis({ host: config.redis.host, port: config.redis.port });

redis.on('connect', () =>
    console.log("✅[Redis] connected")
)

redis.on("error", (err) =>
    console.error("⚠️[Redis] Error: ", err)
)

const cacheLatest = async (topic, data) => {
    const key = `latest: ${topic.replace(/\//g, ':')}`;

    await redis.set(key, JSON.stringify(data), 'EX', 3600);
    console.log(`[Redis] Casched -> ${key}`)
}

const getLatest = async (topic) => {
    const key = `latest: ${topic.replace(/\//g, ':')}`;

    const val = await redis.get(key);
    return val ? JSON.parse(val) : null;
}

module.exports = {
    redis,
    cacheLatest,
    getLatest
}