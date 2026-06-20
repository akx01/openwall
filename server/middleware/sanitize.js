// Simple XSS sanitizer — strips HTML tags from user input to keep text raw and clean
exports.sanitizeString = (str) => {
  if (typeof str !== "string") return "";
  // Strips <tags> to prevent HTML formatting, but leaves quotes and special characters intact
  return str.replace(/<[^>]*>/g, "").trim();
};

// Sanitize all string fields in req.body
exports.sanitizeBody = (req, res, next) => {
  const sanitize = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === "string") {
        obj[key] = exports.sanitizeString(obj[key]);
      } else if (typeof obj[key] === "object" && obj[key] !== null) {
        sanitize(obj[key]);
      }
    }
  };
  sanitize(req.body);
  next();
};