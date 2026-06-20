const Notepad = require("../models/Notepad");

// Active editing users list
let activeNotepadUsers = [];

exports.initNotepadHandlers = (io) => {
  io.on("connection", (socket) => {
    
    // User joins notepad tab
    socket.on("notepad_join", ({ username }) => {
      if (username) {
        socket.data.notepadUsername = username;
        if (!activeNotepadUsers.includes(username)) {
          activeNotepadUsers.push(username);
        }
        io.emit("notepad_users", { users: activeNotepadUsers });
      }
    });

    // User typing / modifying notepad content
    socket.on("notepad_change", async ({ content, username }) => {
      socket.broadcast.emit("notepad_update", { content, by: username });
      
      // Debounce saving is not strictly required here, but we can do a simple direct update
      try {
        await Notepad.findOneAndUpdate(
          { name: "global" },
          { content, updatedAt: new Date() },
          { upsert: true }
        );
      } catch (err) {
        console.error("Notepad save failed:", err.message);
      }
    });

    // User leaves notepad tab / disconnects
    const handleLeave = () => {
      const u = socket.data.notepadUsername;
      if (u) {
        activeNotepadUsers = activeNotepadUsers.filter(x => x !== u);
        io.emit("notepad_users", { users: activeNotepadUsers });
      }
    };

    socket.on("notepad_leave", handleLeave);
    socket.on("disconnect", handleLeave);
  });
};
