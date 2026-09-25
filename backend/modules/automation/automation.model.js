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
    status: { 
        type: String, 
        enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'PARTIAL_SUCCESS', 'FAILED'], 
        default: 'PENDING' 
    },
    approvalStatus: {
        type: String,
        enum: ['NOT_REQUIRED', 'PENDING_APPROVAL', 'APPROVED', 'DECLINED'],
        default: 'NOT_REQUIRED',
        index: true,
    },
    submittedByName: { type: String, default: '' },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    reviewedAt: { type: Date, default: null },
    declineReason: { type: String, maxlength: 500, default: '' },
    scheduledDate: { type: Date, required: false }, // Optional for immediate posts
    jobId: { type: String }
}, { timestamps: true });

export default mongoose.model('Automation', automationSchema);
