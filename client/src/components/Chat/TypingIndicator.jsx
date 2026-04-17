export default function TypingIndicator({ users }) {
  if (!users.length) return null;
  const text = users.length === 1
    ? `${users[0]} is typing`
    : `${users.slice(0, 2).join(", ")} are typing`;

  return (
    <div className="flex items-center gap-2 px-3 py-1 text-xs text-gray-500 dark:text-gray-400">
      <span>{text}</span>
      <div className="flex gap-0.5">
        {[0, 1, 2].map((i) => (
          <span key={i} className="typing-dot w-1.5 h-1.5 bg-gray-400 rounded-full inline-block" />
        ))}
      </div>
    </div>
  );
}