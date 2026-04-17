const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    content: { type: String, required: true, trim: true, maxlength: 2000 },
    tags: [{ type: String, trim: true, maxlength: 30 }],
    author: { type: String, required: true, trim: true, maxlength: 30 },
    authorColor: { type: String, default: "#7C3AED" }, // avatar color
    room: { type: String, default: "global" },
    likes: { type: Number, default: 0 },
    likedBy: [String], // sessionIds that liked
    comments: [
      {
        author: String,
        authorColor: String,
        content: { type: String, maxlength: 500 },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    reports: { type: Number, default: 0 },
    hidden: { type: Boolean, default: false }, // auto-hide if reported > 5 times
    bookmarkedBy: [String], // sessionIds
    // TTL field — MongoDB will delete this document 7 days after createdAt
    createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 7 },
  },
  { timestamps: false }
);

// Index for searching and sorting
postSchema.index({ tags: 1 });
postSchema.index({ likes: -1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ room: 1, createdAt: -1 });

module.exports = mongoose.model("Post", postSchema);