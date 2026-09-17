import { createClient } from "redis";

if (!process.env.REDIS_URL) {
    throw new Error("REDIS_URL must be configured before starting the server");
}

export const redisClient = createClient({ url: process.env.REDIS_URL });

redisClient.on("error", (error) => {
    console.error("Redis client error:", error);
});

export async function connectRedis() {
    if (!redisClient.isOpen) await redisClient.connect();
}
