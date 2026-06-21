// Clear all posts — run once from server directory:
// node clearPosts.js

require("dotenv").config();
const mongoose = require("mongoose");
const Post = require("./models/Post");

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const result = await Post.deleteMany({});
  console.log(`✅ Deleted ${result.deletedCount} posts`);
  process.exit(0);
}).catch(err => {
  console.error("Error:", err.message);
  process.exit(1);
});
