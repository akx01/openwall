// Client-side XSS guard — strip tags from any displayed content
export const sanitize = (str = "") =>
  str
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .trim();