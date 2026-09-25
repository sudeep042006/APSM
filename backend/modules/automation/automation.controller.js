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

if (queueConnection) {
    queueConnection.on('error', (err) => {
        if (err.message.includes('ECONNRESET') || err.message.includes('ETIMEDOUT')) return;
        console.error('🔴 Queue Redis error:', err.message);
    });
}

const crossPostQueue = new Queue('CrossPostQueue', { connection: queueConnection });

const assertAdmin = (req) => {
    if (req.user?.role !== 'admin') {
        const error = new Error('Administrator approval is required.');
        error.statusCode = 403;
        throw error;
    }
};

const enqueuePost = async (post) => {
    const scheduledAt = post.scheduledDate ? new Date(post.scheduledDate).getTime() : Date.now();
    const job = await crossPostQueue.add('publish-post', {
        postId: post._id, userId: post.userId, caption: post.caption, title: post.title,
        body: post.body, hashtags: post.hashtags, link: post.link, platforms: post.platforms, mediaUrl: post.mediaUrl,
    }, { delay: Math.max(scheduledAt - Date.now(), 0) });
    post.jobId = job.id;
    post.status = 'PENDING';
    await post.save();
    return job;
};

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
        const { caption, title, body, hashtags, link, platforms, scheduledDate, requiresApproval } = req.body;
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
            title,
            body,
            hashtags,
            link,
            platforms: JSON.parse(platforms || '[]'),
            mediaUrl,
            cloudinaryId,
            scheduledDate: scheduledDate || new Date(),
            status: 'PENDING',
            approvalStatus: requiresApproval === 'true' ? 'PENDING_APPROVAL' : 'NOT_REQUIRED',
            submittedByName: req.user.name || req.user.email,
        });

        if (newPost.approvalStatus === 'PENDING_APPROVAL') {
            return res.status(202).json({ message: 'Post submitted for administrator approval.', postId: newPost.id });
        }

        // Add to Redis Queue with the delay timer
        const job = await crossPostQueue.add('publish-post', {
            postId: newPost._id,
            userId,
            caption,
            title,
            body,
            hashtags,
            link,
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

export const getPendingApprovals = async (req, res) => {
    try {
        assertAdmin(req);
        const requests = await Automation.find({ approvalStatus: 'PENDING_APPROVAL' }).sort({ createdAt: -1 }).limit(50).lean();
        res.json(requests.map(post => ({ id: post._id, submitterName: post.submittedByName, platforms: post.platforms, scheduledDate: post.scheduledDate, summary: (post.title || post.body || post.caption || '').slice(0, 160), mediaUrl: post.mediaUrl, title: post.title, body: post.body || post.caption, hashtags: post.hashtags, link: post.link })));
    } catch (error) { res.status(error.statusCode || 500).json({ error: error.message || 'Unable to load approval requests.' }); }
};

export const reviewApproval = async (req, res) => {
    try {
        assertAdmin(req);
        const { decision, declineReason = '' } = req.body;
        if (!['accept', 'decline'].includes(decision)) return res.status(400).json({ error: 'decision must be accept or decline.' });
        const post = await Automation.findOne({ _id: req.params.id, approvalStatus: 'PENDING_APPROVAL' });
        if (!post) return res.status(404).json({ error: 'Pending request not found.' });
        post.reviewedBy = req.user.id; post.reviewedAt = new Date();
        if (decision === 'decline') { post.approvalStatus = 'DECLINED'; post.declineReason = String(declineReason).slice(0, 500); await post.save(); return res.json({ status: 'DECLINED' }); }
        post.approvalStatus = 'APPROVED';
        const job = await enqueuePost(post);
        res.json({ status: 'APPROVED', jobId: job.id, draft: { title: post.title, body: post.body || post.caption, hashtags: post.hashtags, link: post.link, platforms: post.platforms, mediaUrl: post.mediaUrl, scheduledDate: post.scheduledDate } });
    } catch (error) { res.status(error.statusCode || 500).json({ error: error.message || 'Unable to review request.' }); }
};

export const getAutomationJobs = async (req, res) => {
    try {
        const userId = req.user.id;
        const posts = await Automation.find({ userId }).sort({ createdAt: -1 }).limit(50);
        
        // Map database fields to the structure expected by the frontend
        const history = posts.map(post => ({
            id: post._id,
            caption: post.title || post.body || post.caption || "New Post",
            title: post.title,
            body: post.body || post.caption,
            hashtags: post.hashtags,
            link: post.link,
            platforms: post.platforms,
            status: post.status === 'COMPLETED' ? 'Published' :
                    post.status === 'FAILED' ? 'Failed' :
                    post.status === 'PARTIAL_SUCCESS' ? 'Partial' :
                    post.scheduledDate && post.scheduledDate > new Date() ? 'Scheduled' : 'Processing',
            scheduledFor: post.scheduledDate,
            createdAt: post.createdAt,
            thumbnail: post.mediaUrl || null
        }));

        res.status(200).json(history);
    } catch (error) {
        console.error('Fetch Automation History Error:', error);
        res.status(500).json({ error: 'Failed to fetch automation history' });
    }
};
