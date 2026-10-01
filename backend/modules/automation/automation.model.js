import mongoose from 'mongoose';

const automationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    caption: { type: String, required: false }, // Kept for backward compatibility
    title: { type: String, required: false },
    body: { type: String, required: false },
    hashtags: { type: String, required: false },
    link: { type: String, required: false },
    platforms: [{ type: String, required: true }],
    mediaUrl: { type: String },
    cloudinaryId: { type: String },
    // Where the job came from. "direct" = composed in the cross-posting form,
    // "creator_request" = an admin approved a creator submission. The history
    // view uses this to say which pipeline produced each job.
    source: { 
        type: String, 
        enum: ['direct', 'creator_request'], 
        default: 'direct' 
    },
    // Set when this job was created by approving a CreatorPost, so the two
    // records stay traceable in both directions.
    creatorPostId: { type: mongoose.Schema.Types.ObjectId, ref: 'CreatorPost', default: null },
    // Per-platform caption rewrites produced by the compose "Enhance with AI"
    // step, shaped [{ platform, text }]. Empty until a provider is connected.
    // Stored with the job so the copy that was actually reviewed is the copy
    // that publishes, even if the draft is edited afterwards.
    platformVariants: {
        type: [{
            platform: { type: String },
            text: { type: String }
        }],
        default: []
    },
    status: { 
        type: String, 
        enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'PARTIAL_SUCCESS', 'FAILED'], 
        default: 'PENDING' 
    },
    scheduledDate: { type: Date, required: false }, // Optional for immediate posts
    jobId: { type: String }
}, { timestamps: true });

export default mongoose.model('Automation', automationSchema);