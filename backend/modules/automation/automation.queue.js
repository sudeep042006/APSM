

import { Queue } from 'bullmq';
import Redis from 'ioredis';
import { redisConnectionOptions } from '../../config/redis.js';
import Automation from './automation.model.js';

export const QUEUE_NAME = 'CrossPostQueue';
export const JOB_NAME = 'publish-post';


let queue = null;
let queueUnavailableReason = null;

const getQueue = () => {
    if (queue) return queue;

    if (!process.env.REDIS_URL) {
        queueUnavailableReason = 'REDIS_URL is not configured on this server.';
        return null;
    }

    const connection = new Redis(process.env.REDIS_URL, redisConnectionOptions);
    connection.on('error', (err) => {
        if (err.message.includes('ECONNRESET') || err.message.includes('ETIMEDOUT')) return;
        console.error('🔴 Queue Redis error:', err.message);
    });

    queue = new Queue(QUEUE_NAME, { connection });
    return queue;
};

/**
 * Enqueues a publish job for an existing Automation document.
 *
 * The payload must match exactly what automation.worker.js destructures from
 * `job.data` — a missing field there is why a job can sit "processing" forever,
 * so the shape is asserted here rather than discovered at publish time.
 *
 * @param {object} params
 * @param {string} params.postId    Automation._id
 * @param {string} params.userId    Owner whose social tokens are used to publish
 * @param {object} params.content   { caption, title, body, hashtags, link }
 * @param {string[]} params.platforms
 * @param {string|null} [params.mediaUrl]  Cloudinary URL, required by every platform task
 * @param {Date|string|null} [params.scheduledDate]  Future time to delay until
 * @returns {Promise<{ enqueued: boolean, jobId: string|null, delayMs: number, reason?: string }>}
 */
export const enqueuePublishJob = async ({
    postId,
    userId,
    content = {},
    platforms = [],
    mediaUrl = null,
    platformVariants = [],
    scheduledDate = null,
}) => {
    const target = getQueue();

    if (!target) {
        return { enqueued: false, jobId: null, delayMs: 0, reason: queueUnavailableReason };
    }

    const { caption, title, body, hashtags, link } = content;

    const scheduleMs = scheduledDate ? new Date(scheduledDate).getTime() : Date.now();
    // A scheduled time in the past means "publish now", not "negative delay".
    const delayMs = Math.max(scheduleMs - Date.now(), 0);

    try {
        const job = await target.add(JOB_NAME, {
            postId: String(postId),
            userId: String(userId),
            caption,
            title,
            body,
            hashtags,
            link,
            platforms,
            mediaUrl,
            platformVariants,
        }, { delay: delayMs });

        return { enqueued: true, jobId: job.id, delayMs };
    } catch (error) {
        console.error('Failed to enqueue publish job:', error.message);
        return {
            enqueued: false,
            jobId: null,
            delayMs,
            reason: error.message || 'The queue rejected the job.',
        };
    }
};

/**
 * Creates the Automation document and dispatches it, rolling the document back
 * if the queue will not accept the job. Callers get one outcome: either a
 * dispatched job exists, or nothing was left behind.
 *
 * @returns {Promise<{ ok: true, job, enqueued } | { ok: false, error: string }>}
 */
export const createAndDispatchJob = async ({
    userId,
    content = {},
    platforms = [],
    mediaUrl = null,
    cloudinaryId = null,
    scheduledDate = null,
    source = 'direct',
    creatorPostId = null,
    platformVariants = [],
}) => {
    const { caption, title, body, hashtags, link } = content;

    const job = await Automation.create({
        userId,
        caption,
        title,
        body,
        hashtags,
        link,
        platforms,
        mediaUrl,
        cloudinaryId,
        scheduledDate: scheduledDate || new Date(),
        status: 'PENDING',
        source,
        creatorPostId,
        platformVariants,
    });

    const dispatch = await enqueuePublishJob({
        postId: job._id,
        userId,
        content,
        platforms,
        mediaUrl,
        platformVariants,
        scheduledDate: job.scheduledDate,
    });

    if (dispatch.enqueued) {
        job.jobId = dispatch.jobId;
        await job.save();
        return { ok: true, job, enqueued: true };
    }

    // Nothing will ever pick this document up, so removing it keeps the database
    // from accumulating posts that are permanently stuck on PENDING.
    await Automation.findByIdAndDelete(job._id);
    return {
        ok: false,
        error: dispatch.reason || 'The publishing queue is unavailable, so the job was not created.',
    };
};

/** Test/teardown helper so the connection is not held open by an import. */
export const closeQueue = async () => {
    if (!queue) return;
    await queue.close();
    queue = null;
};

export default enqueuePublishJob;