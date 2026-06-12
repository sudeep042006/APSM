// modules/auth/auth.model.js

import mongoose from 'mongoose';
import crypto from 'crypto';

// ─── Encryption helpers ───────────────────────────────────────────────────────
const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;

function getKey() {
  if (!process.env.ENCRYPTION_KEY) throw new Error('ENCRYPTION_KEY is not set in .env');
  return Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
}

function encrypt(text) {
  if (!text) return null;
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  const enc = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  return `${iv.toString('hex')}:${enc.toString('hex')}`;
}

function decrypt(stored) {
  if (!stored) return null;
  const [ivHex, encHex] = stored.split(':');
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    getKey(),
    Buffer.from(ivHex, 'hex')
  );
  const dec = Buffer.concat([
    decipher.update(Buffer.from(encHex, 'hex')),
    decipher.final(),
  ]);
  return dec.toString('utf8');
}

// ─── Refresh log sub-schema ───────────────────────────────────────────────────
const refreshLogSchema = new mongoose.Schema(
  {
    status: { type: String, enum: ['success', 'failed'], required: true },
    error: { type: String, default: null },
    refreshedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

// ─── Social account sub-schema ────────────────────────────────────────────────
const socialAccountSchema = new mongoose.Schema(
  {
    platform: {
      type: String,
      enum: ['youtube', 'facebook', 'instagram', 'linkedin'],
      required: true,
    },
    platformUserId: { type: String, required: true },
    platformUsername: { type: String, default: null },

    _accessToken: { type: String, default: null },
    _refreshToken: { type: String, default: null },

    scopes: { type: [String], default: [] },
    expiresAt: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
    connectedAt: { type: Date, default: Date.now },

    refreshLog: { type: [refreshLogSchema], default: [] },
  },
  { _id: true }
);

socialAccountSchema
  .virtual('accessToken')
  .get(function () { return decrypt(this._accessToken); })
  .set(function (v) { this._accessToken = encrypt(v); });

socialAccountSchema
  .virtual('refreshToken')
  .get(function () { return decrypt(this._refreshToken); })
  .set(function (v) { this._refreshToken = encrypt(v); });

socialAccountSchema.methods.isExpired = function () {
  if (!this.expiresAt) return false;
  return new Date() >= this.expiresAt;
};

socialAccountSchema.methods.logRefresh = function (status, error = null) {
  this.refreshLog.push({ status, error });
  if (this.refreshLog.length > 10) this.refreshLog = this.refreshLog.slice(-10);
};

// ─── User schema ──────────────────────────────────────────────────────────────
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
    },
    socialAccounts: [socialAccountSchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: false },
    toObject: { virtuals: false }, // ✅ FIXED (was true)
  }
);

userSchema.methods.getSocialAccount = function (platform) {
  return this.socialAccounts.find(a => a.platform === platform && a.isActive) || null;
};

userSchema.methods.upsertSocialAccount = function (platform, data) {
  const existing = this.socialAccounts.find(a => a.platform === platform);
  if (existing) {
    existing.platformUserId = data.platformUserId;
    existing.platformUsername = data.platformUsername ?? existing.platformUsername;
    existing.accessToken = data.accessToken;
    if (data.refreshToken) existing.refreshToken = data.refreshToken;
    existing.scopes = data.scopes ?? existing.scopes;
    existing.expiresAt = data.expiresAt ?? null;
    existing.isActive = true;
  } else {
    const entry = {
      platform,
      platformUserId: data.platformUserId,
      platformUsername: data.platformUsername ?? null,
      scopes: data.scopes ?? [],
      expiresAt: data.expiresAt ?? null,
    };
    this.socialAccounts.push(entry);
    const added = this.socialAccounts[this.socialAccounts.length - 1];
    added.accessToken = data.accessToken;
    if (data.refreshToken) added.refreshToken = data.refreshToken;
  }
};

// Indexes
// ❌ REMOVED: duplicate email index
userSchema.index({ 'socialAccounts.platform': 1 });

const User = mongoose.model('User', userSchema);

export { User, encrypt, decrypt };