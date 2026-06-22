const Message = require("../models/Message");
const Room = require("../models/Room");
const Notepad = require("../models/Notepad");
const bcrypt = require("bcryptjs");
const { clean } = require("../middleware/profanityFilter");
const { sanitizeString } = require("../middleware/sanitize");
const roomManager = require("./roomManager");

const typingTimers = {};
let activeNotepadUsers = [];

exports.initSocketHandlers = (io) => {
  io.on("connection", (socket) => {
    console.log("Connected:", socket.id);

    // ── DIRECT MESSAGES & FRIENDS ──────────────
    socket.on("join_user_dm", ({ username }) => {
      if (!username) return;
      const normalized = username.toLowerCase().trim();
      socket.join(`user_${normalized}`);
      console.log(`Socket ${socket.id} joined DM room: user_${normalized}`);
    });

    socket.on("send_direct_message", async ({ sender, recipient, content, passwordHash }) => {
      if (!sender || !recipient || !content) return;
      const normalizedSender = sender.toLowerCase().trim();
      const normalizedRecipient = recipient.toLowerCase().trim();

      try {
        const User = require("../models/User");
        const senderDoc = await User.findOne({ username: normalizedSender });
        if (!senderDoc || senderDoc.passwordHash !== passwordHash) {
          socket.emit("dm_error", { error: "Authentication failed" });
          return;
        }

        if (!senderDoc.friends.includes(normalizedRecipient)) {
          socket.emit("dm_error", { error: "You can only message your friends" });
          return;
        }

        const { clean } = require("../middleware/profanityFilter");
        const { sanitizeString } = require("../middleware/sanitize");
        const cleanContent = clean(sanitizeString(content));
        if (!cleanContent || cleanContent.length > 1000) return;

        const DirectMessage = require("../models/DirectMessage");
        const dm = await DirectMessage.create({
          sender: normalizedSender,
          recipient: normalizedRecipient,
          content: cleanContent,
        });

        // Broadcast to both users
        io.to(`user_${normalizedSender}`).emit("new_direct_message", dm);
        io.to(`user_${normalizedRecipient}`).emit("new_direct_message", dm);
      } catch (err) {
        console.error("DM error:", err.message);
      }
    });

    // ── JOIN ROOM ─────────────────────────────
    socket.on("join_room", async ({ room, username, color, sessionId, password }) => {
      const roomDoc = await Room.findOne({ name: room });
      if (roomDoc) {
        if (roomDoc.bannedUsers.includes(username)) {
          socket.emit("banned_from_room", { room });
          return;
        }
        if (roomDoc.isPrivate) {
          if (!password) {
            socket.emit("kicked_from_room", { room });
            return;
          }
          const valid = await bcrypt.compare(password, roomDoc.password);
          if (!valid) {
            socket.emit("kicked_from_room", { room });
            return;
          }
        }
      }

      socket.join(room);
      socket.data = { room, username, color, sessionId };

      roomManager.joinRoom(room, {
        socketId: socket.id,
        username: sanitizeString(username),
        color,
        sessionId
      });

      socket.to(room).emit("user_joined", {
        username: sanitizeString(username),
        color,
        memberCount: roomManager.getMemberCount(room)
      });

      socket.emit("room_info", {
        memberCount: roomManager.getMemberCount(room),
        members: roomManager.getRoomMembers(room)
      });

      await Room.findOneAndUpdate({ name: room }, { memberCount: roomManager.getMemberCount(room) });
      io.emit("online_count", roomManager.getTotalOnline());
    });

    // ── SEND MESSAGE ──────────────────────────
    socket.on("send_message", async ({ room, content, author, authorColor, sessionId }) => {
      // Security check: ensure socket is actually joined to the room
      if (!socket.rooms.has(room)) {
        return;
      }

      const clean_content = clean(sanitizeString(content));
      if (!clean_content || clean_content.length > 1000) return;

      try {
        const message = await Message.create({
          room, author: sanitizeString(author), authorColor, sessionId,
          content: clean_content
        });
        io.to(room).emit("new_message", {
          _id: message._id, room, author: message.author, authorColor,
          sessionId, content: clean_content, createdAt: message.createdAt, reactions: {}
        });
      } catch (err) {
        console.error("Message save error:", err.message);
      }
    });

    // ── DELETE MESSAGE ────────────────────────
    socket.on("delete_message", async ({ messageId, sessionId, room }) => {
      const msg = await Message.findById(messageId);
      if (!msg || msg.sessionId !== sessionId) return;
      msg.deleted = true;
      msg.content = "[deleted]";
      await msg.save();
      io.to(room).emit("message_deleted", { messageId });
    });

    // ── MESSAGE REACTION ──────────────────────
    socket.on("react_message", async ({ messageId, emoji, sessionId, room }) => {
      const msg = await Message.findById(messageId);
      if (!msg) return;
      const current = msg.reactions.get(emoji) || [];
      const idx = current.indexOf(sessionId);
      if (idx === -1) current.push(sessionId);
      else current.splice(idx, 1);
      msg.reactions.set(emoji, current);
      await msg.save();
      io.to(room).emit("message_reaction", {
        messageId, reactions: Object.fromEntries(msg.reactions)
      });
    });

    // ── KICK USER ─────────────────────────────
    socket.on("kick_user", ({ room, targetUsername, leaderUsername }) => {
      const members = roomManager.getRoomMembers(room);
      const target = members.find(m => m.username === targetUsername);
      if (!target) return;
      io.to(target.socketId).emit("kicked_from_room", { room, by: leaderUsername });
    });

    // ── TYPING INDICATOR ──────────────────────
    socket.on("typing_start", ({ room, username }) => {
      socket.to(room).emit("typing", { username });
      clearTimeout(typingTimers[socket.id]);
      typingTimers[socket.id] = setTimeout(() => {
        socket.to(room).emit("stop_typing", { username });
      }, 3000);
    });

    socket.on("typing_stop", ({ room, username }) => {
      clearTimeout(typingTimers[socket.id]);
      socket.to(room).emit("stop_typing", { username });
    });

    // ── NOTEPAD COLLABORATION ──────────────────
    socket.on("notepad_join", ({ username }) => {
      socket.join("global_notepad");
      socket.data.notepadUsername = username;
      if (username && !activeNotepadUsers.includes(username)) {
        activeNotepadUsers.push(username);
      }
      io.to("global_notepad").emit("notepad_users", { users: activeNotepadUsers });
    });

    socket.on("notepad_change", async ({ content, username, sessionId }) => {
      socket.to("global_notepad").emit("notepad_update", { content, by: username, sessionId });
      try {
        await Notepad.findOneAndUpdate(
          { name: "global" },
          { content, updatedAt: new Date() },
          { upsert: true }
        );
      } catch (err) {
        console.error("Notepad save error:", err.message);
      }
    });

    const handleNotepadLeave = () => {
      const u = socket.data.notepadUsername;
      if (u) {
        activeNotepadUsers = activeNotepadUsers.filter((x) => x !== u);
        io.to("global_notepad").emit("notepad_users", { users: activeNotepadUsers });
      }
    };

    socket.on("notepad_leave", handleNotepadLeave);

    // ── DISCONNECT ────────────────────────────
    socket.on("disconnect", async () => {
      const { room, username } = socket.data || {};
      if (room) {
        roomManager.leaveRoom(room, socket.id);
        socket.to(room).emit("user_left", {
          username, memberCount: roomManager.getMemberCount(room)
        });
        await Room.findOneAndUpdate({ name: room }, { memberCount: roomManager.getMemberCount(room) });
      }
      handleNotepadLeave();
      roomManager.leaveAllRooms(socket.id);
      clearTimeout(typingTimers[socket.id]);
      io.emit("online_count", roomManager.getTotalOnline());
    });
  });
};