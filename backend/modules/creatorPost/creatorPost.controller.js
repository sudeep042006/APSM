import { CreatorPost } from "./creatorPost.model.js";
import { createAndDispatchJob } from "../automation/automation.queue.js";
import { User } from '../auth/auth.model.js';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';

const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ resource_type: 'auto' }, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

// Creator: Submit a new post for review
export const submitPost = async (req, res, next) => {
  try {
    if (req.user.role !== "creator") {
      return res
        .status(403)
        .json({ error: "Only creators can submit posts for review." });
    }

    let { title, body, hashtags, link, mediaUrl, platforms } = req.body;
    
    // Parse platforms if they come in as JSON string (FormData)
    if (typeof platforms === "string") {
      try { platforms = JSON.parse(platforms); } catch (e) {}
    }

    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.buffer);
      mediaUrl = uploadResult.secure_url;
    }

    const newPost = new CreatorPost({
      creatorId: req.user._id,
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

    const posts = await CreatorPost.find({})
      .populate("creatorId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, posts });
  } catch (error) {
    next(error);
  }
};
export const approvePost = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Only admins can approve posts." });
    }

    const { postId } = req.params;
    const post = await CreatorPost.findOne({
      _id: postId,
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found or unauthorized." });
    }

    if (post.status !== "PENDING") {
      return res.status(400).json({ error: `Post is already ${post.status}.` });
    }


    post.status = "APPROVED";
    post.approvedBy = req.user._id;
    post.automationJobId = null;
    post.adminFeedback = null;
    await post.save();

    res.status(200).json({
      success: true,
      message: "Post approved and ready to import to compose.",
      post,

    });
  } catch (error) {
    next(error);
  }
};


export const rejectPost = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Only admins can reject posts." });
    }

    const { postId } = req.params;
    const { feedback } = req.body;

    const post = await CreatorPost.findOne({
      _id: postId,
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


