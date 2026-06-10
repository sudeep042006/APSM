// ── JWT Authentication Guard Middleware ──────────────────────────────
// Extracts the Bearer token from the Authorization header, verifies it,
// and attaches the decoded user payload to req.user for downstream use.

import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  try {
    // ── Extract the token from the Authorization header ───────────────
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      const error = new Error("Authentication required. No token provided.");
      error.statusCode = 401;
      throw error;
    }

    const token = authHeader.split(" ")[1];

    // ── Verify the JWT and attach decoded payload ─────────────────────
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    next();
  } catch (error) {
    // ── Handle expired or malformed tokens ────────────────────────────
    if (error.name === "TokenExpiredError") {
      error.message = "Session expired. Please log in again.";
      error.statusCode = 401;
    } else if (error.name === "JsonWebTokenError") {
      error.message = "Invalid authentication token.";
      error.statusCode = 401;
    }

    error.statusCode = error.statusCode || 401;
    next(error);
  }
};

export default authMiddleware;
