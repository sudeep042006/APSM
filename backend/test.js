import mongoose from 'mongoose';
import Automation from './modules/automation/automation.model.js';
mongoose.connect(process.env.MONGODB_URI).then(async () => {
    const jobs = await Automation.find().sort({createdAt: -1}).limit(2);
    console.log(JSON.stringify(jobs, null, 2));
    process.exit(0);
});
