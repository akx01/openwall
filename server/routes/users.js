const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { sanitizeBody } = require("../middleware/sanitize");
const { clean } = require("../middleware/profanityFilter");

// Auth Middleware using custom headers
const authenticateUser = async (req, res, next) => {
  try {
    const username = req.headers["x-username"];
    const passwordHash = req.headers["x-password-hash"];

    if (!username || !passwordHash) {
      return res.status(401).json({ error: "Authentication credentials required" });
    }

    const normalized = username.toLowerCase().trim();
    const user = await User.findOne({ username: normalized });

    if (!user || user.passwordHash !== passwordHash) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(500).json({ error: "Authentication failed" });
  }
};

// ── POST /api/users/sync — Register or sync local profile with database
router.post("/sync", sanitizeBody, async (req, res) => {
  try {
    const { username, passwordHash, color, isPrivate } = req.body;
    if (!username || !passwordHash) {
      return res.status(400).json({ error: "Username and password hash are required" });
    }

    const normalized = username.toLowerCase().trim();
    let user = await User.findOne({ username: normalized });

    if (user) {
      // Validate existing credentials
      if (user.passwordHash !== passwordHash) {
        return res.status(401).json({ error: "Username already taken or wrong password." });
      }
      
      let modified = false;
      // Update color if changed
      if (color && user.color !== color) {
        user.color = color;
        modified = true;
      }
      // Update isPrivate if changed
      if (typeof isPrivate === "boolean" && user.isPrivate !== isPrivate) {
        user.isPrivate = isPrivate;
        modified = true;
      }

      if (modified) {
        await user.save();
      }

      return res.json({
        success: true,
        isNew: false,
        username: user.username,
        color: user.color,
        isPrivate: !!user.isPrivate,
      });
    } else {
      // Create new backend profile
      user = await User.create({
        username: normalized,
        passwordHash,
        color: color || "#7C3AED",
        isPrivate: !!isPrivate,
      });
      return res.status(201).json({
        success: true,
        isNew: true,
        username: user.username,
        color: user.color,
        isPrivate: !!user.isPrivate,
      });
    }
  } catch (err) {
    console.error("Sync user error:", err.message);
    res.status(500).json({ error: "Failed to sync user profile" });
  }
});

// ── GET /api/users/friends — Retrieve friends and pending requests
router.get("/friends", authenticateUser, async (req, res) => {
  try {
    res.json({
      friends: req.user.friends,
      friendRequests: req.user.friendRequests,
      sentRequests: req.user.sentRequests,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve friends" });
  }
});

// ── GET /api/users/search — Search other users to send requests
router.get("/search", authenticateUser, async (req, res) => {
  try {
    const queryStr = req.query.q ? req.query.q.trim().toLowerCase() : "";
    if (!queryStr) {
      return res.json([]);
    }

    // Find users whose name contains query string, excluding the requester
    const users = await User.find({
      username: { $regex: queryStr, $options: "i" },
      _id: { $ne: req.user._id },
    })
      .select("username color")
      .limit(10)
      .lean();

    // Map relationships relative to requester
    const results = users.map((u) => {
      const isFriend = req.user.friends.includes(u.username);
      const isPending = req.user.friendRequests.includes(u.username);
      const isSent = req.user.sentRequests.includes(u.username);
      return {
        username: u.username,
        color: u.color,
        isFriend,
        isPending,
        isSent,
      };
    });

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "Search failed" });
  }
});

// ── POST /api/users/friend-request — Send a friend request
router.post("/friend-request", authenticateUser, async (req, res) => {
  try {
    const { recipient } = req.body;
    if (!recipient) return res.status(400).json({ error: "Recipient username required" });

    const targetUsername = recipient.toLowerCase().trim();
    if (targetUsername === req.user.username) {
      return res.status(400).json({ error: "You cannot add yourself as a friend" });
    }

    const recipientUser = await User.findOne({ username: targetUsername });
    if (!recipientUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check relationship state
    if (req.user.friends.includes(targetUsername)) {
      return res.status(400).json({ error: "You are already friends" });
    }

    if (req.user.sentRequests.includes(targetUsername)) {
      return res.status(400).json({ error: "Friend request already sent" });
    }

    // If target has already sent a request to user, auto-accept and become friends!
    if (req.user.friendRequests.includes(targetUsername)) {
      // Add to friends
      req.user.friends.push(targetUsername);
      req.user.friendRequests = req.user.friendRequests.filter((name) => name !== targetUsername);

      recipientUser.friends.push(req.user.username);
      recipientUser.sentRequests = recipientUser.sentRequests.filter((name) => name !== req.user.username);

      await req.user.save();
      await recipientUser.save();

      // Notify recipient via Socket
      const io = req.app.get("io");
      if (io) {
        io.to(`user_${targetUsername}`).emit("friend_request_accepted", { username: req.user.username });
      }

      return res.json({ success: true, status: "accepted" });
    }

    // Otherwise standard request
    req.user.sentRequests.push(targetUsername);
    recipientUser.friendRequests.push(req.user.username);

    await req.user.save();
    await recipientUser.save();

    // Emit live update to the recipient
    const io = req.app.get("io");
    if (io) {
      io.to(`user_${targetUsername}`).emit("friend_request_received", { username: req.user.username });
    }

    res.json({ success: true, status: "sent" });
  } catch (err) {
    console.error("Friend request error:", err.message);
    res.status(500).json({ error: "Failed to send friend request" });
  }
});

// ── POST /api/users/friend-request/accept — Accept friend request
router.post("/friend-request/accept", authenticateUser, async (req, res) => {
  try {
    const { requester } = req.body;
    if (!requester) return res.status(400).json({ error: "Requester username required" });

    const targetUsername = requester.toLowerCase().trim();

    if (!req.user.friendRequests.includes(targetUsername)) {
      return res.status(400).json({ error: "No pending friend request from this user" });
    }

    const requesterUser = await User.findOne({ username: targetUsername });
    if (!requesterUser) {
      return res.status(404).json({ error: "Requester not found" });
    }

    // Accept friend request
    req.user.friends.push(targetUsername);
    req.user.friendRequests = req.user.friendRequests.filter((name) => name !== targetUsername);

    requesterUser.friends.push(req.user.username);
    requesterUser.sentRequests = requesterUser.sentRequests.filter((name) => name !== req.user.username);

    await req.user.save();
    await requesterUser.save();

    // Notify requester via Socket
    const io = req.app.get("io");
    if (io) {
      io.to(`user_${targetUsername}`).emit("friend_request_accepted", { username: req.user.username });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Accept friend request error:", err.message);
    res.status(500).json({ error: "Failed to accept friend request" });
  }
});

// ── POST /api/users/friend-request/decline — Decline/cancel friend request
router.post("/friend-request/decline", authenticateUser, async (req, res) => {
  try {
    const { requester } = req.body;
    if (!requester) return res.status(400).json({ error: "Requester username required" });

    const targetUsername = requester.toLowerCase().trim();

    // Remove from incoming requests if present
    req.user.friendRequests = req.user.friendRequests.filter((name) => name !== targetUsername);
    // Also remove from sent requests just in case user is canceling their own request
    req.user.sentRequests = req.user.sentRequests.filter((name) => name !== targetUsername);
    await req.user.save();

    const otherUser = await User.findOne({ username: targetUsername });
    if (otherUser) {
      otherUser.sentRequests = otherUser.sentRequests.filter((name) => name !== req.user.username);
      otherUser.friendRequests = otherUser.friendRequests.filter((name) => name !== req.user.username);
      await otherUser.save();
    }

    // Notify other user to refresh lists
    const io = req.app.get("io");
    if (io) {
      io.to(`user_${targetUsername}`).emit("friend_request_received", { username: req.user.username });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Decline friend request error:", err.message);
    res.status(500).json({ error: "Failed to decline request" });
  }
});

// ── GET /api/users/profile/:username — Get public profile details
router.get("/profile/:username", async (req, res) => {
  try {
    const targetUsername = req.params.username.toLowerCase().trim();
    const target = await User.findOne({ username: targetUsername })
      .select("username color isPrivate friends friendRequests sentRequests")
      .lean();

    if (!target) {
      return res.status(404).json({ error: "User not found" });
    }

    const requester = req.headers["x-username"] ? req.headers["x-username"].toLowerCase().trim() : null;
    
    let isFriend = false;
    let isPending = false; // Requester sent target a request
    let isSent = false;    // Target sent requester a request

    if (requester) {
      isFriend = target.friends.includes(requester);
      isPending = target.friendRequests.includes(requester);
      isSent = target.sentRequests.includes(requester);
    }

    const canViewPosts = !target.isPrivate || isFriend || requester === targetUsername;

    res.json({
      username: target.username,
      color: target.color,
      isPrivate: !!target.isPrivate,
      isFriend,
      isPending,
      isSent,
      canViewPosts,
      friendCount: target.friends.length,
    });
  } catch (err) {
    console.error("Get profile error:", err.message);
    res.status(500).json({ error: "Failed to load user profile" });
  }
});

module.exports = router;
