const Message = require("../models/Message");
const Room = require("../models/Room");
const { clean, isProfane } = require("../middleware/profanityFilter");
const { sanitizeString } = require("../middleware/sanitize");
const roomManager = require("./roomManager");

// Typing timeout trackers: socketId → timeout
const typingTimers = {};

exports.initSocketHandlers = (io) => {
  io.on("connection", (socket) => {
    console.log(`🔌 Connected: ${socket.id}`);

    // ── JOIN ROOM ─────────────────────────────
    socket.on("join_room", async ({ room, username, color, sessionId }) => {
      socket.join(room);
      socket.data = { room, username, color, sessionId };

      roomManager.joinRoom(room, {
        socketId: socket.id,
        username: sanitizeString(username),
        color,
        sessionId,
      });

      // Notify room that user joined
      socket.to(room).emit("user_joined", {
        username: sanitizeString(username),
        color,
        memberCount: roomManager.getMemberCount(room),
      });

      // Send current member count to the joiner
      socket.emit("room_info", {
        memberCount: roomManager.getMemberCount(room),
        members: roomManager.getRoomMembers(room),
      });

      // Update room member count in DB
      await Room.findOneAndUpdate({ name: room }, { memberCount: roomManager.getMemberCount(room) });

      // Emit global online count
      io.emit("online_count", roomManager.getTotalOnline());
    });

    // ── SEND MESSAGE ──────────────────────────
    socket.on("send_message", async ({ room, content, author, authorColor, sessionId }) => {
      // Sanitize + filter
      const clean_content = clean(sanitizeString(content));
      if (!clean_content || clean_content.length > 1000) return;

      try {
        const message = await Message.create({
          room,
          author: sanitizeString(author),
          authorColor,
          sessionId,
          content: clean_content,
        });

        // Broadcast to the room
        io.to(room).emit("new_message", {
          _id: message._id,
          room,
          author: message.author,
          authorColor,
          sessionId,
          content: clean_content,
          createdAt: message.createdAt,
          reactions: {},
        });
      } catch (err) {
        console.error("Message save error:", err);
      }
    });

    // ── DELETE OWN MESSAGE ────────────────────
    socket.on("delete_message", async ({ messageId, sessionId, room }) => {
      const msg = await Message.findById(messageId);
      if (!msg || msg.sessionId !== sessionId) return;
      msg.deleted = true;
      msg.content = "[message deleted]";
      await msg.save();
      io.to(room).emit("message_deleted", { messageId });
    });

    // ── REACT TO MESSAGE ──────────────────────
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
        messageId,
        reactions: Object.fromEntries(msg.reactions),
      });
    });

    // ── TYPING INDICATOR ──────────────────────
    socket.on("typing_start", ({ room, username }) => {
      socket.to(room).emit("typing", { username });
      // Auto-stop typing after 3s
      clearTimeout(typingTimers[socket.id]);
      typingTimers[socket.id] = setTimeout(() => {
        socket.to(room).emit("stop_typing", { username });
      }, 3000);
    });

    socket.on("typing_stop", ({ room, username }) => {
      clearTimeout(typingTimers[socket.id]);
      socket.to(room).emit("stop_typing", { username });
    });

    // ── DISCONNECT ────────────────────────────
    socket.on("disconnect", async () => {
      const { room, username, color } = socket.data || {};
      if (room) {
        roomManager.leaveRoom(room, socket.id);
        socket.to(room).emit("user_left", {
          username,
          memberCount: roomManager.getMemberCount(room),
        });
        await Room.findOneAndUpdate({ name: room }, { memberCount: roomManager.getMemberCount(room) });
      }
      roomManager.leaveAllRooms(socket.id);
      clearTimeout(typingTimers[socket.id]);
      io.emit("online_count", roomManager.getTotalOnline());
      console.log(`❌ Disconnected: ${socket.id}`);
    });
  });
};