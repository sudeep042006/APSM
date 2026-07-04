import { Queue } from 'bullmq';
import { connectRedis } from '../config/redis';
import Automation from './automation.model';

const crossPostQueue = new Queue('CrossPostQueue', {
    connection: connectRedis
})

const ScheduleCrossPost = async (req, res) => {
    try {
        const { caption, platforms, mediaUrl, scheduledDate } = req.body;
        
        // calculate delay in ms
        const scheduleTime = new Date(scheduledDate).getTime();
        const now = Date.now();
        const delay = Math.max(scheduleTime - now, 0);

        //save this to mongo;
        const newPost = await Automation.create({
          caption,
          platforms: JSON.parse(platforms),
          mediaUrl,
          scheduledDate,
          status: 'SCHEDULED'
        });
        
         // job to bullmq
         const job = await crossPostQueue.add('publish-post' ,{
              postId: newPost._id,
              caption,
              platforms: JSON.parse(platforms),
              mediaUrl
         }, {
           delay: delay
         });

         newPost.jobId = job.id;
         await newPost.save();
         console.log("scheduled post saved");

         res.status(200).json({
          message: "post scheduled successfully",
          jobId: job.id,
          willPostIn: `${Math.round(delay / 60000)} minutes`
         })
    }

    catch(error)
    {
        console.log(error);
        res.status(500).json({
            message: "failed to schedule post",
            error: error.message
        })
    }
};

export default ScheduleCrossPost;
