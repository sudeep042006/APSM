// ── Auth Controller ──────────────────────────────────────────────────
// Handles user registration, login, and profile retrieval.
// All responses follow the uniform { success, message, data } pattern.

import jwt from "jsonwebtoken";
import User from "./auth.model.js";

// ── Helper: Generate a signed JWT token ─────────────────────────────
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// ── POST /api/auth/register ─────────────────────────────────────────
// Creates a new user account and returns a JWT token.
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // ── Check if user already exists ────────────────────────────────
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const error = new Error("An account with this email already exists.");
      error.statusCode = 409;
      throw error;
    }

    // ── Create and persist new user ─────────────────────────────────
    const user = await User.create({ name, email, password });

    // ── Generate JWT and respond ────────────────────────────────────
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "Account created successfully.",
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── POST /api/auth/login ────────────────────────────────────────────
// Authenticates an existing user and returns a JWT token.
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // ── Find user and explicitly select password field ──────────────
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      const error = new Error("Invalid email or password.");
      error.statusCode = 401;
      throw error;
    }

    // ── Verify password against stored hash ─────────────────────────
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      const error = new Error("Invalid email or password.");
      error.statusCode = 401;
      throw error;
    }

    // ── Generate JWT and respond ────────────────────────────────────
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Login successful.",
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          connectedPlatforms: user.connectedPlatforms,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── GET /api/auth/me ────────────────────────────────────────────────
// Returns the authenticated user's profile (requires auth middleware).
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      const error = new Error("User not found.");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        connectedPlatforms: user.connectedPlatforms,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};
