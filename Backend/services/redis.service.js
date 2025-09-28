import Redis from "ioredis"

const redisClient = new Redis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD
})

redisClient.on("connect", function(){
    console.log("Redis connected");
})

redisClient.on("error", function(error) {
    console.error("Redis connection error:", error);
});

export default redisClient;
