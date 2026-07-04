import { Worker } from 'bullmq';
import axios from 'axios';
import Redis from 'ioredis';
import { redisConnectionOptions } from '../../config/redis.js';
import Automation from './automation.model.js';
import { getValidToken } from '../../utils/tokenManager.js';
import { User } from '../auth/auth.model.js';

// Use a dedicated connection for the Worker
const workerConnection = process.env.REDIS_URL 
    ? new Redis(process.env.REDIS_URL, redisConnectionOptions) 
    : null;

const worker = new Worker('CrossPostQueue', async (job) => {
    const { postId, userId, caption, platforms, mediaUrl } = job.data;
    
    await Automation.findByIdAndUpdate(postId, { status: 'PROCESSING' });
    console.log(`Executing Scheduled Job ${job.id} for Post ${postId}`);

    const user = await User.findById(userId);
    if (!user) {
        throw new Error('User not found. Cannot retrieve tokens.');
    }

    const publishTasks = [];

    // Helper to extract specific platform tasks
    const addPlatformTask = (promise, platformName) => {
        return promise.then(result => ({ status: 'fulfilled', platform: platformName, result }))
                      .catch(error => ({ status: 'rejected', platform: platformName, error: error.response?.data || error.message }));
    };

    // --- LINKEDIN EXECUTION ---
    if (platforms.includes('LinkedIn') || platforms.includes('linkedin')) {
        publishTasks.push(addPlatformTask((async () => {
            const token = await getValidToken(userId, 'linkedin');
            const account = user.getSocialAccount('linkedin');
            const personId = account.platformUserId; // urn:li:person:ID

            // 1. Download media into memory
            const mediaBufferResponse = await axios.get(mediaUrl, { responseType: 'arraybuffer' });
            const mediaBuffer = Buffer.from(mediaBufferResponse.data);
            const isVideo = mediaUrl.match(/\.(mp4|mov|wmv|flv|avi|webm|mkv)$/i);

            let uploadUrl = '';
            let mediaUrn = '';
            let uploadToken = null;

            // 2. Initialize Upload
            if (isVideo) {
                const initRes = await axios.post('https://api.linkedin.com/rest/videos?action=initializeUpload', {
                    initializeUploadRequest: {
                        owner: `urn:li:person:${personId}`,
                        fileSizeBytes: mediaBuffer.length
                    }
                }, { headers: { 'Authorization': `Bearer ${token}`, 'LinkedIn-Version': '202601', 'Content-Type': 'application/json' } });

                uploadUrl = initRes.data.value.uploadInstructions[0].uploadUrl;
                mediaUrn = initRes.data.value.video;
                uploadToken = initRes.data.value.uploadToken;
            } else {
                const initRes = await axios.post('https://api.linkedin.com/rest/images?action=initializeUpload', {
                    initializeUploadRequest: {
                        owner: `urn:li:person:${personId}`
                    }
                }, { headers: { 'Authorization': `Bearer ${token}`, 'LinkedIn-Version': '202601', 'Content-Type': 'application/json' } });

                uploadUrl = initRes.data.value.uploadUrl;
                mediaUrn = initRes.data.value.image;
            }

            // 3. Upload Binary Data
            await axios.put(uploadUrl, mediaBuffer, {
                headers: {
                    'Content-Type': 'application/octet-stream',
                    'Authorization': `Bearer ${token}`
                },
                maxBodyLength: Infinity,
                maxContentLength: Infinity
            });

            // 3.5 Finalize Upload (Videos Only)
            if (isVideo && uploadToken) {
                await axios.post('https://api.linkedin.com/rest/videos?action=finalizeUpload', {
                    finalizeUploadRequest: {
                        video: mediaUrn,
                        uploadToken: uploadToken
                    }
                }, { headers: { 'Authorization': `Bearer ${token}`, 'LinkedIn-Version': '202601', 'Content-Type': 'application/json' } });
            }

            // 4. Create Post
            const payload = {
                author: `urn:li:person:${personId}`,
                commentary: caption,
                visibility: "PUBLIC",
                distribution: {
                    feedDistribution: "MAIN_FEED",
                    targetEntities: [],
                    thirdPartyDistributionChannels: []
                },
                content: {
                    media: {
                        id: mediaUrn
                    }
                },
                lifecycleState: "PUBLISHED",
                isReshareDisabledByAuthor: false
            };

            return axios.post('https://api.linkedin.com/rest/posts', payload, {
                headers: { 
                    'Authorization': `Bearer ${token}`, 
                    'LinkedIn-Version': '202601', // Must be YYYYMM format
                    'Content-Type': 'application/json'
                }
            });
        })(), 'LinkedIn'));
    }

    // --- FACEBOOK EXECUTION ---
    if (platforms.includes('Facebook') || platforms.includes('facebook')) {
        publishTasks.push(addPlatformTask((async () => {
            const token = await getValidToken(userId, 'facebook');
            const account = user.getSocialAccount('facebook');
            const pageId = account.platformUserId;

            // Simple check to determine if it's a video (can be improved)
            const endpointType = mediaUrl.match(/\.(mp4|mov|wmv|flv|avi)$/i) ? 'videos' : 'photos';

            const payload = {
                url: mediaUrl,
                message: caption,
                access_token: token
            };

            return axios.post(`https://graph.facebook.com/v19.0/${pageId}/${endpointType}`, payload);
        })(), 'Facebook'));
    }

    // --- INSTAGRAM EXECUTION ---
    if (platforms.includes('Instagram') || platforms.includes('instagram')) {
        publishTasks.push(addPlatformTask((async () => {
            const token = await getValidToken(userId, 'instagram');
            const account = user.getSocialAccount('instagram');
            const igAccountId = account.platformUserId;

            const isVideo = mediaUrl.match(/\.(mp4|mov|wmv|flv|avi|webm|mkv)$/i);

            // Step 1: Create media container
            const createPayload = {
                caption: caption,
                access_token: token
            };

            if (isVideo) {
                createPayload.video_url = mediaUrl;
                createPayload.media_type = 'REELS';
            } else {
                createPayload.image_url = mediaUrl;
            }

            const createContainerResponse = await axios.post(`https://graph.facebook.com/v19.0/${igAccountId}/media`, createPayload);
            const creationId = createContainerResponse.data.id;

            // Step 1.5: Wait for processing if video
            if (isVideo) {
                let status = 'IN_PROGRESS';
                let attempts = 0;
                while (status !== 'FINISHED' && status !== 'ERROR' && attempts < 20) {
                    await new Promise(resolve => setTimeout(resolve, 5000));
                    const statusRes = await axios.get(`https://graph.facebook.com/v19.0/${creationId}?fields=status_code&access_token=${token}`);
                    status = statusRes.data.status_code;
                    attempts++;
                }
                if (status !== 'FINISHED') {
                    throw new Error(`Instagram Video Processing failed or timed out. Status: ${status}`);
                }
            }

            // Step 2: Publish the media
            return axios.post(`https://graph.facebook.com/v19.0/${igAccountId}/media_publish`, {
                creation_id: creationId,
                access_token: token
            });
        })(), 'Instagram'));
    }

    // --- YOUTUBE EXECUTION ---
    if (platforms.includes('YouTube') || platforms.includes('youtube')) {
        publishTasks.push(addPlatformTask((async () => {
            // YouTube ONLY accepts videos. If it's an image, throw an error early.
            const isVideo = mediaUrl.match(/\.(mp4|mov|wmv|flv|avi|webm|mkv)$/i);
            if (!isVideo) {
                throw new Error("YouTube only supports video files. Provided media appears to be an image or unsupported format.");
            }

            const token = await getValidToken(userId, 'youtube');

            // 1. Fetch the video as a Buffer (ArrayBuffer) from Cloudinary
            // YouTube API does NOT support chunked transfer encoding, so we MUST know the exact file size.
            // Downloading as a stream causes form-data to use chunked encoding, which silently fails on YouTube.
            const videoBufferResponse = await axios.get(mediaUrl, {
                responseType: 'arraybuffer'
            });

            const videoBuffer = Buffer.from(videoBufferResponse.data);

            const FormData = (await import('form-data')).default;
            const form = new FormData();

            const metadata = {
                snippet: {
                    title: caption.substring(0, 50) || "Video Title", 
                    description: caption,
                    categoryId: "22"
                },
                status: {
                    privacyStatus: "public" // or "unlisted" / "private"
                }
            };

            form.append('metadata', JSON.stringify(metadata), { contentType: 'application/json' });
            form.append('media', videoBuffer, { contentType: 'video/mp4', filename: 'video.mp4' });

            return axios.post(
                'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=multipart&part=snippet,status', 
                form, 
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        ...form.getHeaders() // This will now include a proper Content-Length header
                    },
                    maxBodyLength: Infinity,
                    maxContentLength: Infinity
                }
            );
        })(), 'YouTube'));
    }

    // Execute concurrently
    const results = await Promise.allSettled(publishTasks);

    // Evaluate results
    const successful = results.filter(r => r.value && r.value.status === 'fulfilled');
    const failed = results.filter(r => r.value && r.value.status === 'rejected');

    failed.forEach(f => {
        console.error(`[Worker] Platform ${f.value.platform} failed for post ${postId}:`, JSON.stringify(f.value.error));
    });

    let finalStatus = 'COMPLETED';
    if (failed.length === publishTasks.length && publishTasks.length > 0) {
        finalStatus = 'FAILED';
    } else if (failed.length > 0) {
        finalStatus = 'PARTIAL_SUCCESS';
    }

    await Automation.findByIdAndUpdate(postId, { status: finalStatus });
    console.log(`Job ${job.id} completed with status: ${finalStatus}. Success: ${successful.length}, Failed: ${failed.length}`);

}, { 
    connection: workerConnection,
    concurrency: 5 // Processing up to 5 jobs concurrently
});

// Graceful Failure Handling
worker.on('failed', async (job, err) => {
    console.error(`Job ${job.id} failed fundamentally: ${err.message}`);
    if (job?.data?.postId) {
        await Automation.findByIdAndUpdate(job.data.postId, { status: 'FAILED' });
    }
});

export default worker;