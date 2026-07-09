import mongoose from 'mongoose';

const automationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    caption: { type: String, required: true },
    platforms: [{ type: String, required: true }],
    mediaUrl: { type: String },
    cloudinaryId: { type: String },
    status: { 
        type: String, 
        enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'PARTIAL_SUCCESS', 'FAILED'], 
        default: 'PENDING' 
    },
    scheduledDate: { type: Date, required: false }, // Optional for immediate posts
    jobId: { type: String }
}, { timestamps: true });

export default mongoose.model('Automation', automationSchema);