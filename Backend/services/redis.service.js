import Redis from "ioredis"

const redisClient = new Redis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
    retryStrategy(times) {
        if (times >= 3) {
            console.warn("Redis unavailable after 3 attempts, skipping cache.");
            return null;
        }
        return Math.min(times * 500, 2000);
    },
    lazyConnect: true
})

redisClient.connect().then(() => {
    console.log("Redis connected")
}).catch((err) => {
    console.warn("Redis connection failed:", err.message)
})

redisClient.on("error", (err) => console.error("Redis error:", err.message))

export default redisClient;