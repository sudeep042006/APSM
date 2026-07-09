import { Queue } from 'bullmq';
import Redis from 'ioredis';
import { redisConnectionOptions } from '../../config/redis.js';
import Automation from './automation.model.js';
import cloudinary from '../../config/cloudinary.js';
import streamifier from 'streamifier';

// Use a dedicated connection for the Queue
const queueConnection = process.env.REDIS_URL 
    ? new Redis(process.env.REDIS_URL, redisConnectionOptions) 
    : null;

const crossPostQueue = new Queue('CrossPostQueue', { connection: queueConnection });

const uploadToCloudinary = (fileBuffer) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { resource_type: 'auto' }, 
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );
        streamifier.createReadStream(fileBuffer).pipe(stream);
    });
};

export const createAutomationJob = async (req, res) => {
    try {
        const userId = req.user.id;
        const { caption, platforms, scheduledDate } = req.body;
        let { mediaUrl } = req.body; // In case they send a URL directly instead of a file
        let cloudinaryId = null;

        if (req.file) {
            // Upload to Cloudinary using streamifier
            const uploadResult = await uploadToCloudinary(req.file.buffer);
            mediaUrl = uploadResult.secure_url;
            cloudinaryId = uploadResult.public_id;
        }

        // Calculate delay in milliseconds
        const scheduleTime = scheduledDate ? new Date(scheduledDate).getTime() : Date.now();
        const now = Date.now();
        const delay = Math.max(scheduleTime - now, 0);

        // Save pending post to DB
        const newPost = await Automation.create({
            userId,
            caption,
            platforms: JSON.parse(platforms || '[]'),
            mediaUrl,
            cloudinaryId,
            scheduledDate: scheduledDate || new Date(),
            status: 'PENDING' // Job is about to be queued
        });

        // Add to Redis Queue with the delay timer
        const job = await crossPostQueue.add('publish-post', {
            postId: newPost._id,
            userId,
            caption,
            platforms: JSON.parse(platforms || '[]'),
            mediaUrl
        }, {
            delay: delay
        });

        // Attach Job ID to DB record
        newPost.jobId = job.id;
        await newPost.save();

        res.status(200).json({
            message: 'Post successfully scheduled in the queue',
            jobId: job.id,
            mediaUrl,
            willPostInMinutes: Math.round(delay / 60000)
        });

    } catch (error) {
        console.error('Queue Scheduling Error:', error);
        res.status(500).json({ error: 'Failed to schedule post: ' + error.message });
    }
};