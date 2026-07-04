import mongoose from 'mongoose';

const automationSchema = new mongoose.Schema(
  {
    caption: {
      type: String,
      required: true,
    },
    platforms: [
      {
        type: String,
        required: true,
      },
    ],
    mediaUrl: {
      type: String, //  first go to claudinary 
    },
    status: {
      type: String,
      enum: ['SCHEDULED', 'PROCESSING', 'COMPLETED', 'FAILED'],
      default: 'SCHEDULED',
    },
    scheduledDate: {
      type: Date,
      required: true,
    },
    jobId: {
      type: String, // To tie it to the Redis job
    },
  },
  {
    timestamps: true,
  }
);

const Automation = mongoose.model('Automation', automationSchema);

export default Automation;