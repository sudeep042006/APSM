import { CreatorPost } from "./creatorPost.model.js";
import { createAndDispatchJob } from "../automation/automation.queue.js";
import { User } from "../auth/auth.model.js";

// Creator: Submit a new post for review
export const submitPost = async (req, res, next) => {
  try {
    if (req.user.role !== "creator") {
      return res
        .status(403)
        .json({ error: "Only creators can submit posts for review." });
    }

    if (!req.user.adminId) {
      return res
        .status(400)
        .json({ error: "Creator is not assigned to an admin." });
    }

    const { title, body, hashtags, link, mediaUrl, platforms } = req.body;

    const newPost = new CreatorPost({
      creatorId: req.user._id,
      adminId: req.user.adminId, // Ensure it routes to the correct admin
      title,
      body,
      hashtags,
      link,
      mediaUrl,
      platforms,
      status: "PENDING",
    });

    await newPost.save();
    res.status(201).json({ success: true, post: newPost });
  } catch (error) {
    next(error);
  }
};

// Creator: Get all their own submitted posts
export const getCreatorPosts = async (req, res, next) => {
  try {
    if (req.user.role !== "creator") {
      return res.status(403).json({ error: "Access denied." });
    }

    const posts = await CreatorPost.find({ creatorId: req.user._id }).sort({
      createdAt: -1,
    });

    res.status(200).json({ success: true, posts });
  } catch (error) {
    next(error);
  }
};

// Admin: Get all incoming posts pending review
export const getIncomingPosts = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Only admins can view incoming posts." });
    }

    const posts = await CreatorPost.find({ adminId: req.user._id })
      .populate("creatorId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, posts });
  } catch (error) {
    next(error);
  }
};

// Admin: Approve a post (hands it to the cross-posting pipeline)
//
// The post has to end up as a dispatched publishing job on the admin's own
// connected accounts, not just a database row. createAndDispatchJob writes the
// Automation record and hands it to the BullMQ queue in one step, and deletes
// the record again if the queue will not take the job — so an approve either
// produces a job that will actually publish, or leaves nothing behind.
export const approvePost = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Only admins can approve posts." });
    }

    const { postId } = req.params;
    const post = await CreatorPost.findOne({
      _id: postId,
      adminId: req.user._id,
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found or unauthorized." });
    }

    if (post.status !== "PENDING") {
      return res.status(400).json({ error: `Post is already ${post.status}.` });
    }

    const result = await createAndDispatchJob({
      // The job runs on the admin's credentials, which are the accounts the
      // creator was targeting.
      userId: req.user._id,
      content: {
        caption: post.body,
        title: post.title,
        body: post.body,
        hashtags: post.hashtags,
        link: post.link,
      },
      platforms: post.platforms,
      mediaUrl: post.mediaUrl || null,
      source: "creator_request",
      creatorPostId: post._id,
    });

    if (!result.ok) {
      // Nothing was queued, so the submission stays pending and the admin can
      // retry once the queue is reachable. Reporting a 5xx rather than a
      // success keeps the UI from claiming it was published.
      return res.status(502).json({
        error: result.error,
        post,
      });
    }

    post.status = "APPROVED";
    post.approvedBy = req.user._id;
    post.automationJobId = result.job._id;
    post.adminFeedback = null;
    await post.save();

    res.status(200).json({
      success: true,
      message: "Post approved and queued for publishing.",
      post,
      automationJob: {
        id: result.job._id,
        queueJobId: result.job.jobId || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Reject a post with feedback
export const rejectPost = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Only admins can reject posts." });
    }

    const { postId } = req.params;
    const { feedback } = req.body;

    const post = await CreatorPost.findOne({
      _id: postId,
      adminId: req.user._id,
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found or unauthorized." });
    }

    if (post.status !== "PENDING") {
      return res.status(400).json({ error: `Post is already ${post.status}.` });
    }

    post.status = "REJECTED";
    post.adminFeedback = feedback;
    await post.save();

    res.status(200).json({ success: true, message: "Post rejected.", post });
  } catch (error) {
    next(error);
  }
};
