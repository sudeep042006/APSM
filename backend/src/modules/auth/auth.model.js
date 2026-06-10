// ── User Schema & Model ─────────────────────────────────────────────
// Defines the User document schema for MongoDB. Stores local credentials
// along with optional OAuth tokens for connected social platforms.

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// ── User Schema Definition ──────────────────────────────────────────
const userSchema = new mongoose.Schema(
  {
    // ── Core Identity Fields ──────────────────────────────────────────
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Never return password in queries by default
    },
    avatar: {
      type: String,
      default: "",
    },

    // ── Connected Platform OAuth Tokens ───────────────────────────────
    connectedPlatforms: {
      youtube: {
        accessToken: { type: String, default: null },
        refreshToken: { type: String, default: null },
        channelId: { type: String, default: null },
        connected: { type: Boolean, default: false },
      },
      linkedin: {
        accessToken: { type: String, default: null },
        refreshToken: { type: String, default: null },
        profileId: { type: String, default: null },
        connected: { type: Boolean, default: false },
      },
      meta: {
        accessToken: { type: String, default: null },
        pageId: { type: String, default: null },
        instagramAccountId: { type: String, default: null },
        connected: { type: Boolean, default: false },
      },
    },
  },
  {
    // ── Schema Options ────────────────────────────────────────────────
    timestamps: true,
  }
);

// ── Pre-save Hook: Hash password before persisting ──────────────────
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ── Instance Method: Compare candidate password with stored hash ────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
