const rateLimit = require("express-rate-limit");

// Global limiter — 200 requests per 15 min per IP
exports.globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please slow down." },
});

// Strict limiter for post creation — 10 posts per 5 min
exports.postCreateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  message: { error: "You are posting too fast. Wait a few minutes." },
});

// Message limiter — 30 messages per minute
exports.messageLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: "Slow down! Message limit reached." },
});