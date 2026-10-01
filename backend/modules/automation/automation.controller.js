import Automation from './automation.model.js';
import cloudinary from '../../config/cloudinary.js';
import streamifier from 'streamifier';
import { createAndDispatchJob } from './automation.queue.js';

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
        const userId = req.user._id;
        const { caption, title, body, hashtags, link, platforms } = req.body;
        let { mediaUrl } = req.body; // In case they send a URL directly instead of a file
        let cloudinaryId = null;

        if (req.file) {
            // Upload to Cloudinary using streamifier
            const uploadResult = await uploadToCloudinary(req.file.buffer);
            mediaUrl = uploadResult.secure_url;
            cloudinaryId = uploadResult.public_id;
        }

        let platformList;
        try {
            platformList = JSON.parse(platforms || '[]');
        } catch (parseError) {
            return res.status(400).json({ error: 'platforms must be a JSON array of platform ids.' });
        }

        // Per-platform AI rewrites. Absent while no provider is connected, and
        // validated here so a malformed payload is rejected rather than stored.
        let platformVariants = [];
        if (req.body.platformVariants) {
            try {
                platformVariants = JSON.parse(req.body.platformVariants);
            } catch (parseError) {
                return res.status(400).json({ error: 'platformVariants must be a JSON array.' });
            }
            if (!Array.isArray(platformVariants)) {
                return res.status(400).json({ error: 'platformVariants must be a JSON array.' });
            }
        }

        // Same path an approved creator submission takes, so a composed post and
        // an approved one behave identically from here on.
        const result = await createAndDispatchJob({
            userId,
            content: { caption, title, body, hashtags, link },
            platforms: platformList,
            mediaUrl: mediaUrl || null,
            cloudinaryId,
            scheduledDate: req.body.scheduledDate || null,
            source: 'direct',
            platformVariants,
        });

        if (!result.ok) {
            return res.status(502).json({
                error: result.error,
            });
        }

        res.status(200).json({
            message: 'Post successfully scheduled in the queue',
            jobId: result.job.jobId || null,
            postId: result.job._id,
            mediaUrl,
            willPostInMinutes: Math.max(Math.round((result.job.scheduledDate.getTime() - Date.now()) / 60000), 0)
        });

    } catch (error) {
        console.error('Queue Scheduling Error:', error);
        res.status(500).json({ error: 'Failed to schedule post: ' + error.message });
    }
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
            thumbnail: post.mediaUrl || null,
            // Lets the history view say whether a job was composed here or
            // imported by approving a creator submission.
            source: post.source || 'direct',
            creatorPostId: post.creatorPostId || null
        }));

        res.status(200).json(history);
    } catch (error) {
        console.error('Fetch Automation History Error:', error);
        res.status(500).json({ error: 'Failed to fetch automation history' });
    }
};