import React from "react";
import { motion } from "framer-motion";
import { Home, MessageSquare, Edit3, FileText, Settings } from "lucide-react";

export default function BottomNav({ activeTab, onChangeTab, hasActiveRoom }) {
  const tabs = [
    { id: "home",     label: "Home",     icon: Home },
    { id: "rooms",    label: "Rooms",    icon: MessageSquare },
    { id: "write",    label: "Write",    icon: Edit3 },
    { id: "notepad",  label: "Notepad",  icon: FileText },
    { id: "settings", label: "Profile",  icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden">
      <div className="glass-effect border-t border-gray-100 dark:border-white/5 flex justify-around py-2 px-2 safe-area-pb bg-white/80 dark:bg-navy-900/80 backdrop-blur-md">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <motion.button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-2 rounded-2xl transition-colors duration-200 relative min-h-[50px] ${
                isActive
                  ? "text-brand"
                  : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
              }`}
            >
              {isActive && (
                <motion.div 
                  layoutId="activeTabIndicatorMobile"
                  className="absolute inset-0 bg-brand/8 dark:bg-brand/15 rounded-2xl" 
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <span className={`text-xl mb-1 relative z-10 ${isActive ? "text-brand" : ""}`}>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              </span>
              <span className={`text-[10px] font-bold tracking-wide relative z-10 ${isActive ? "text-brand" : ""}`}>
                {tab.label}
              </span>
              {tab.id === "rooms" && hasActiveRoom && (
                <span className="absolute top-2.5 right-1/4 w-2 h-2 bg-brand rounded-full animate-pulse border-2 border-white dark:border-navy-900 z-20" />
              )}
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
