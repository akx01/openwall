import { useEffect, useState, useRef } from "react";
import socket from "../../socket";
import axios from "axios";
import { useUserStore } from "../../store/userStore";
import { useUIStore } from "../../store/uiStore";

const API = import.meta.env.VITE_API_URL || "/api";

export default function GEditNotepad() {
  const { username } = useUserStore();
  const { showToast } = useUIStore();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingUsers, setEditingUsers] = useState([]);
  const textareaRef = useRef(null);

  // Load initial notepad content
  useEffect(() => {
    const fetchNotepad = async () => {
      try {
        const { data } = await axios.get(`${API}/notepad`);
        setContent(data.content || "");
      } catch (err) {
        console.error("Failed to load notepad", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchNotepad();

    // Socket events
    if (!socket.connected) {
      socket.connect();
    }
    socket.emit("notepad_join", { username });
    
    socket.on("notepad_update", ({ content: newContent, by }) => {
      if (by !== username) {
        const textarea = textareaRef.current;
        if (textarea) {
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          setContent(newContent);
          setTimeout(() => {
            try {
              textarea.setSelectionRange(start, end);
            } catch (e) {}
          }, 0);
        } else {
          setContent(newContent);
        }
      }
    });

    socket.on("notepad_users", ({ users }) => {
      setEditingUsers(users.filter((u) => u !== username));
    });

    return () => {
      socket.emit("notepad_leave", { username });
      socket.off("notepad_update");
      socket.off("notepad_users");
    };
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    setContent(val);
    socket.emit("notepad_change", { content: val, username });
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-gray-400">
        Loading Notepad...
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm p-4 overflow-hidden h-[calc(100vh-180px)] sm:h-[600px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800 mb-3">
        <div>
          <h2 className="font-bold text-lg text-gray-900 dark:text-gray-50">Shared Notepad</h2>
          <p className="text-xs text-gray-400">Collaborate with other online users in real-time</p>
        </div>
        {editingUsers.length > 0 && (
          <div className="flex items-center gap-1 bg-brand/10 text-brand dark:bg-brand/20 dark:text-brand-light text-xs font-semibold px-2 py-1 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
            {editingUsers.length} editing
          </div>
        )}
      </div>

      {/* Editor area */}
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          placeholder="Type something here... everyone online will see and can edit this in real-time!"
          className="w-full h-full bg-gray-50 dark:bg-gray-850 rounded-2xl p-4 text-sm text-gray-800 dark:text-gray-100 outline-none resize-none placeholder-gray-400 border border-transparent focus:border-brand/20"
        />
      </div>
    </div>
  );
}
