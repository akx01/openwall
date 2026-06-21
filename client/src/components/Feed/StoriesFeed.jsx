import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUserStore } from "../../store/userStore";
import { useUIStore } from "../../store/uiStore";
import { Plus, X, ChevronLeft, ChevronRight } from "lucide-react";
import CreateStoryModal from "./CreateStoryModal";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "/api";
const STORY_THEMES = {
  fire: "bg-gradient-to-tr from-red-600 via-orange-500 to-yellow-400",
  sun: "bg-gradient-to-tr from-amber-500 to-yellow-300",
  magma: "bg-gradient-to-tr from-stone-900 via-red-950 to-red-800",
  neon: "bg-gradient-to-tr from-rose-500 via-red-500 to-amber-400",
};

export default function StoriesFeed() {
  const { username } = useUserStore();
  const { showToast } = useUIStore();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Fullscreen Viewer State
  const [activeUserIndex, setActiveUserIndex] = useState(null);
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const fetchStories = async () => {
    try {
      const { data } = await axios.get(`${API}/stories`);
      setStories(data);
    } catch (err) {
      console.error("Failed to load stories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  // Group stories by author
  const grouped = stories.reduce((acc, story) => {
    if (!acc[story.author]) {
      acc[story.author] = {
        author: story.author,
        authorColor: story.authorColor,
        items: [],
      };
    }
    acc[story.author].items.push(story);
    return acc;
  }, {});

  const userStoryGroups = Object.values(grouped);

  // Auto-progress timer for stories
  useEffect(() => {
    if (activeUserIndex === null) return;

    setProgress(0);
    const interval = 50; // update progress every 50ms
    const duration = 5000; // 5 seconds per story
    const step = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [activeUserIndex, activeStoryIndex]);

  const handleNext = () => {
    const currentGroup = userStoryGroups[activeUserIndex];
    if (!currentGroup) return;

    if (activeStoryIndex < currentGroup.items.length - 1) {
      setActiveStoryIndex((prev) => prev + 1);
    } else {
      // Go to next user's story group
      if (activeUserIndex < userStoryGroups.length - 1) {
        setActiveUserIndex((prev) => prev + 1);
        setActiveStoryIndex(0);
      } else {
        // End of all stories
        closeViewer();
      }
    }
  };

  const handlePrev = () => {
    if (activeStoryIndex > 0) {
      setActiveStoryIndex((prev) => prev - 1);
    } else {
      // Go to previous user's story group
      if (activeUserIndex > 0) {
        setActiveUserIndex((prev) => prev - 1);
        // Start at the last story of that group
        const prevGroup = userStoryGroups[activeUserIndex - 1];
        setActiveStoryIndex(prevGroup.items.length - 1);
      } else {
        // Restart current story if at absolute beginning
        setProgress(0);
      }
    }
  };

  const closeViewer = () => {
    setActiveUserIndex(null);
    setActiveStoryIndex(0);
    setProgress(0);
  };

  const openViewer = (index) => {
    setActiveUserIndex(index);
    setActiveStoryIndex(0);
    setProgress(0);
  };

  const currentGroup = activeUserIndex !== null ? userStoryGroups[activeUserIndex] : null;
  const currentStory = currentGroup ? currentGroup.items[activeStoryIndex] : null;

  return (
    <div className="w-full max-w-2xl mx-auto py-2">
      {/* Horizontal Carousel */}
      <div className="flex gap-4 items-center overflow-x-auto no-scrollbar py-3 px-1">
        
        {/* Create Story Button */}
        <div className="flex flex-col items-center shrink-0">
          <button
            onClick={() => {
              if (!username) {
                showToast("Please log in to share a story!", "warning");
                return;
              }
              setIsCreateOpen(true);
            }}
            className="w-16 h-16 rounded-full border-2 border-dashed border-gray-300 dark:border-white/10 flex items-center justify-center bg-white dark:bg-navy-800 hover:border-brand dark:hover:border-brand hover:scale-105 active:scale-95 transition-all shadow-sm"
          >
            <Plus size={20} className="text-gray-400 dark:text-gray-300 group-hover:text-brand" />
          </button>
          <span className="text-[10px] font-semibold text-gray-500 mt-2">Add Story</span>
        </div>

        {/* Story Bubble Groups */}
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center shrink-0 animate-pulse">
              <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-navy-700" />
              <div className="w-10 h-2 bg-gray-200 dark:bg-navy-700 rounded mt-2" />
            </div>
          ))
        ) : (
          userStoryGroups.map((group, index) => (
            <div
              key={group.author}
              onClick={() => openViewer(index)}
              className="flex flex-col items-center shrink-0 cursor-pointer group"
            >
              {/* Ring Indicator */}
              <div className="relative p-0.5 rounded-full bg-gradient-to-tr from-brand via-brand-light to-yellow-400 animate-glow-pulse group-hover:scale-105 active:scale-95 transition-all">
                <div className="w-14 h-14 rounded-full border-2 border-white dark:border-navy-900 overflow-hidden bg-gray-100 flex items-center justify-center">
                  <div
                    className="w-full h-full flex items-center justify-center font-bold text-white text-base select-none"
                    style={{ background: group.authorColor || "#EF4444" }}
                  >
                    {group.author[0].toUpperCase()}
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-semibold text-gray-700 dark:text-gray-300 mt-2 truncate w-16 text-center">
                {group.author === username ? "Your Story" : group.author}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Create Story Modal */}
      {isCreateOpen && (
        <CreateStoryModal
          onClose={() => setIsCreateOpen(false)}
          onPublished={fetchStories}
        />
      )}

      {/* Fullscreen Story Viewer */}
      <AnimatePresence>
        {activeUserIndex !== null && currentStory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 backdrop-blur-md"
          >
            {/* Main Story Card container */}
            <div className="relative w-full max-w-sm aspect-[9/16] rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between">
              
              {/* Animated Progress Bars at Top */}
              <div className="absolute top-4 inset-x-4 z-30 flex gap-1.5">
                {currentGroup.items.map((item, idx) => (
                  <div key={item._id} className="h-1 flex-1 bg-white/25 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white transition-all duration-75"
                      style={{
                        width:
                          idx < activeStoryIndex
                            ? "100%"
                            : idx === activeStoryIndex
                            ? `${progress}%`
                            : "0%",
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Author Header */}
              <div className="absolute top-8 inset-x-4 z-30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm border border-white/20"
                    style={{ background: currentGroup.authorColor }}
                  >
                    {currentGroup.author[0].toUpperCase()}
                  </div>
                  <div>
                    <span className="font-bold text-xs text-white drop-shadow">{currentGroup.author}</span>
                  </div>
                </div>
                <button
                  onClick={closeViewer}
                  className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/60 transition"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Background gradient theme */}
              <div className={`absolute inset-0 ${STORY_THEMES[currentStory.theme] || STORY_THEMES.fire} flex flex-col justify-center p-8 text-center`}>
                <div className="absolute inset-0 bg-black/10 pointer-events-none" />
                
                {/* Content Text */}
                <p className="text-white font-display text-xl font-extrabold leading-snug drop-shadow-md break-words max-h-[60%] overflow-y-auto no-scrollbar px-2 relative z-10 select-none">
                  {currentStory.content}
                </p>
              </div>

              {/* Tap overlays to navigate */}
              <div className="absolute inset-0 z-20 flex">
                <div onClick={handlePrev} className="w-1/2 h-full cursor-left" />
                <div onClick={handleNext} className="w-1/2 h-full cursor-right" />
              </div>

              {/* Floating Side Nav for Large screens */}
              <div className="hidden sm:block absolute -left-16 top-1/2 -translate-y-1/2 z-30">
                <button
                  onClick={handlePrev}
                  className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center border border-white/10 backdrop-blur-md transition"
                >
                  <ChevronLeft size={24} />
                </button>
              </div>
              <div className="hidden sm:block absolute -right-16 top-1/2 -translate-y-1/2 z-30">
                <button
                  onClick={handleNext}
                  className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center border border-white/10 backdrop-blur-md transition"
                >
                  <ChevronRight size={24} />
                </button>
              </div>

              {/* Bottom watermark */}
              <div className="absolute bottom-6 inset-x-0 text-center z-30">
                <p className="text-[10px] text-white/40 tracking-widest font-bold font-display uppercase">Openwall Stories</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
