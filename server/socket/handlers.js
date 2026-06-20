const Message = require("../models/Message");
const Room = require("../models/Room");
const Notepad = require("../models/Notepad");
const { clean } = require("../middleware/profanityFilter");
const { sanitizeString } = require("../middleware/sanitize");
const roomManager = require("./roomManager");

const typingTimers = {};
let activeNotepadUsers = [];

exports.initSocketHandlers = (io) => {
  io.on("connection", (socket) => {
    console.log("Connected:", socket.id);

    // ── JOIN ROOM ─────────────────────────────
    socket.on("join_room", async ({ room, username, color, sessionId }) => {
      const roomDoc = await Room.findOne({ name: room });
      if (roomDoc && roomDoc.bannedUsers.includes(username)) {
        socket.emit("banned_from_room", { room });
        return;
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

    socket.on("notepad_change", async ({ content, username }) => {
      socket.to("global_notepad").emit("notepad_update", { content, by: username });
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