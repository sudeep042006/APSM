import mongoose from 'mongoose';

const creatorPostSchema = new mongoose.Schema({
    creatorId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    adminId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    title: { type: String, required: false },
    body: { type: String, required: true },
    hashtags: { type: String, required: false },
    link: { type: String, required: false },
    mediaUrl: { type: String, required: false },
    platforms: [{ 
        type: String, 
        enum: ['youtube', 'facebook', 'instagram', 'linkedin'], 
        required: true 
    }],
    status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED'],
        default: 'PENDING'
    },
    adminFeedback: { type: String, default: null },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    automationJobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Automation', default: null }
}, { timestamps: true });

export const CreatorPost = mongoose.model('CreatorPost', creatorPostSchema);

