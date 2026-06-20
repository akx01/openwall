import React from "react";

export default function BottomNav({ activeTab, onChangeTab, hasActiveRoom }) {
  const tabs = [
    { id: "home", label: "Home", icon: "🏠" },
    { id: "rooms", label: "Rooms", icon: "💬" },
    { id: "notepad", label: "Notepad", icon: "📝" },
    { id: "settings", label: "Settings", icon: "⚙️" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-t border-gray-100 dark:border-gray-800 flex justify-around py-2 px-1 md:hidden">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChangeTab(tab.id)}
            className={`flex flex-col items-center justify-center flex-1 py-1 rounded-2xl transition-all relative ${
              isActive
                ? "text-brand font-bold scale-105"
                : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            }`}
          >
            <span className="text-xl mb-0.5">{tab.icon}</span>
            <span className="text-[10px] tracking-wide">{tab.label}</span>
            {tab.id === "rooms" && hasActiveRoom && (
              <span className="absolute top-1 right-1/3 w-2 h-2 bg-brand rounded-full animate-pulse" />
            )}
          </button>
        );
      })}
    </div>
  );
}
