export default function BottomNav({ activeTab, onChangeTab, hasActiveRoom }) {
  const tabs = [
    { id: "home",     label: "Home",     icon: "🏠" },
    { id: "rooms",    label: "Rooms",    icon: "💬" },
    { id: "write",    label: "Write",    icon: "✍️" },
    { id: "notepad",  label: "Notepad",  icon: "📝" },
    { id: "settings", label: "Profile",  icon: "⚙️" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden">
      <div className="glass-effect border-t border-gray-100 dark:border-white/5 flex justify-around py-1.5 px-2 safe-area-pb">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 py-2 rounded-2xl transition-all duration-200 relative ${
                isActive
                  ? "text-brand scale-[1.05]"
                  : "text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-300"
              }`}
            >
              {isActive && (
                <div className="absolute inset-0 bg-brand/8 dark:bg-brand/15 rounded-2xl" />
              )}
              <span className={`text-xl mb-0.5 transition-transform ${isActive ? "scale-110" : ""}`}>
                {tab.icon}
              </span>
              <span className={`text-[10px] font-semibold tracking-wide relative z-10 ${isActive ? "text-brand" : ""}`}>
                {tab.label}
              </span>
              {tab.id === "rooms" && hasActiveRoom && (
                <span className="absolute top-2 right-1/4 w-2 h-2 bg-brand rounded-full animate-pulse border-2 border-white dark:border-navy-900" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
