import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redisUrl = process.env.REDIS_URL;

// Redis connection configuration
export const redisConnectionOptions = {
    // Required for BullMQ
    maxRetriesPerRequest: null,

    // Required/recommended for BullMQ
    enableReadyCheck: false,

    // Keep TCP connection alive
    keepAlive: 10000,

    // Connection timeout
    connectTimeout: 10000,

    // Retry connection with increasing delay
    retryStrategy: (times) => {
        return Math.min(times * 500, 5000);
    },

    // TLS configuration for Upstash / rediss://
    ...(redisUrl?.startsWith('rediss://')
        ? {
            tls: {
                rejectUnauthorized: false
            }
        }
        : {})
};

// Create Redis client only when REDIS_URL exists
const redisClient = redisUrl
    ? new Redis(redisUrl, redisConnectionOptions)
    : null;

// Redis event handlers
if (redisClient) {
    redisClient.on('connect', () => {
        console.log('🟢 Redis connected');
    });

    redisClient.on('ready', () => {
        console.log('🟢 Redis ready');
    });

    redisClient.on('error', (err) => {
        console.error('🔴 Redis error:', err.message);
    });

    redisClient.on('reconnecting', (delay) => {
        console.log(`🟡 Redis reconnecting...`);
    });

    redisClient.on('close', () => {
        console.log('🟠 Redis connection closed');
    });

    redisClient.on('end', () => {
        console.log('🔴 Redis connection ended');
    });
} else {
    console.warn('🟡 REDIS_URL is not configured. Redis is disabled.');
}

export default redisClient;