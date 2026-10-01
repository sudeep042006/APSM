const { Queue } = require('bullmq');
const IORedis = require('ioredis');

const connection = new IORedis('rediss://default:gQAAAAAAAb7VAAIgcDJhNDZiNzEyNGVjZjQ0ZDZlODJlZTM4MGIxMzFhZjI3Mw@popular-mouse-114389.upstash.io:6379', {
    maxRetriesPerRequest: null,
    tls: { rejectUnauthorized: false }
});

const queue = new Queue('CrossPostQueue', { connection });

async function getFailed() {
    const failed = await queue.getFailed(0, 5);
    if (failed.length === 0) {
        console.log('No failed jobs found in BullMQ.');
    }
    for (const job of failed) {
        console.log('Job ID:', job.id);
        console.log('Failed reason:', job.failedReason);
        console.log('Data:', job.data);
    }
    const completed = await queue.getCompleted(0, 5);
    for (const job of completed) {
        console.log('Completed Job ID:', job.id);
        console.log('Return value:', job.returnvalue);
    }
    process.exit(0);
}

getFailed().catch(console.error);

