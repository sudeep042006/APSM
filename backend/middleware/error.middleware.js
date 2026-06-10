// ── Global Error Handling Middleware ─────────────────────────────────
// Catches all unhandled errors piped through next(err) and returns a
// uniform JSON response structure: { success, message, code }.
// Must be registered LAST in the Express middleware chain.

const errorMiddleware = (err, req, res, _next) => {
  // ── Determine the status code ───────────────────────────────────────
  const statusCode = err.statusCode || 500;

  // ── Build the uniform error response ────────────────────────────────
  const response = {
    success: false,
    message: err.message || "Internal Server Error",
    code: statusCode,
  };

  // ── Log the full error in development mode ──────────────────────────
  if (process.env.NODE_ENV === "development") {
    console.error(`❌ [${statusCode}] ${err.message}`);
    if (err.stack) {
      console.error(err.stack);
    }
  }

  res.status(statusCode).json(response);
};

export default errorMiddleware;
