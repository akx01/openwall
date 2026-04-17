const EMOJIS = ["❤️", "😂", "😮", "😢", "😠", "👍", "🔥", "🎉"];

export default function EmojiPicker({ onSelect, onClose }) {
  return (
    <div className="absolute z-50 bottom-8 left-0 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 p-2 flex gap-1">
      {EMOJIS.map((e) => (
        <button
          key={e}
          onClick={() => { onSelect(e); onClose(); }}
          className="text-xl hover:scale-125 transition-transform p-1"
        >
          {e}
        </button>
      ))}
    </div>
  );
}