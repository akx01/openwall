import Sidebar from "./Sidebar";
import Header from "./Header";
import ChatPanel from "../Chat/ChatPanel";
import { useEffect, useState } from "react";
import { useChatStore } from "../../store/chatStore";

export default function Layout({ children, onOpenSettings }) {
  const { loadRooms } = useChatStore();
  const [chatOpen, setChatOpen] = useState(true);

  useEffect(() => {
    loadRooms();
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0">
        <Header onOpenSettings={onOpenSettings} />
        <div className="flex flex-1 overflow-hidden">
          {/* Feed */}
          <div className="flex-1 overflow-hidden">{children}</div>

          {/* Chat panel — toggleable */}
          <div className={`${chatOpen ? "w-80" : "w-0"} transition-all duration-300 overflow-hidden flex-shrink-0`}>
            <ChatPanel />
          </div>
        </div>
      </div>

      {/* Chat toggle button */}
      <button
        onClick={() => setChatOpen((v) => !v)}
        className="fixed bottom-6 left-60 z-40 bg-brand text-white w-10 h-10 rounded-full shadow-lg flex items-center justify-center hover:bg-brand-dark transition text-sm"
        title={chatOpen ? "Hide chat" : "Show chat"}
      >
        {chatOpen ? "✕" : "💬"}
      </button>
    </div>
  );
}