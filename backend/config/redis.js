import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redisUrl = process.env.REDIS_URL;

export const redisConnectionOptions = {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryStrategy: (times) => {
        return Math.min(times * 100, 3000);
    }
};

const redisClient = redisUrl ? new Redis(redisUrl, redisConnectionOptions) : null;


if (redisClient) {
    redisClient.on('connect', () => {
        console.log('🟢 Redis connected');
    });

    redisClient.on('error', (err) => {
        console.error('🔴 Redis error:', err.message);
    });

    redisClient.on('reconnecting', () => {
        console.log('🟡 Redis reconnecting...');
    });
}

export default redisClient;