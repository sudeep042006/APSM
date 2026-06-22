import Redis from 'ioredis';

let redisClient = null;

const connectRedis = () => {
    if (!process.env.REDIS_URL) {
        console.warn('⚠️ REDIS_URL is not defined. Redis will not be connected. Automation features may not work.');
        return null;
    }

    if (!redisClient) {
        redisClient = new Redis(process.env.REDIS_URL, {
            maxRetriesPerRequest: null,
            enableReadyCheck: false,
        });

        redisClient.on('connect', () => {
            console.log('🟢 Successfully connected to Upstash Redis');
        });

        redisClient.on('error', (err) => {
            console.error('🔴 Redis connection error:', err);
        });
    }
    return redisClient;
};

// Export the singleton client for other files to use
export { redisClient };
// Export the initialization function to be called in server.js
export default connectRedis;
