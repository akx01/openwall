import { formatDistanceToNow } from "date-fns";

// Generate a random color for user avatar
export const generateColor = () => {
  const colors = [
    "#7C3AED", "#2563EB", "#DC2626", "#16A34A",
    "#D97706", "#DB2777", "#0891B2", "#7C3AED",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Generate avatar initials from username
export const getInitials = (name = "") =>
  name.slice(0, 2).toUpperCase();

// Format timestamp as "2 hours ago"
export const timeAgo = (date) =>
  formatDistanceToNow(new Date(date), { addSuffix: true });

// Generate a random session ID
export const generateSessionId = () =>
  Math.random().toString(36).slice(2) + Date.now().toString(36);

// Copy text to clipboard — returns promise
export const copyToClipboard = (text) =>
  navigator.clipboard.writeText(text);

// Debounce utility
export const debounce = (fn, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

// Truncate long strings
export const truncate = (str, n = 100) =>
  str.length > n ? str.slice(0, n) + "..." : str;