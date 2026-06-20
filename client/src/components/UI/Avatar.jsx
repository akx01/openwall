import { getInitials } from "../../utils/helpers";

// Colored circle avatar with initials
export default function Avatar({ username, color, size = "md", ring = false }) {
  const sizes = {
    xs: "w-5 h-5 text-[9px]",
    sm: "w-7 h-7 text-xs",
    md: "w-9 h-9 text-sm",
    lg: "w-12 h-12 text-base",
  };
  return (
    <div
      className={`${sizes[size]} rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 select-none ${
        ring ? "ring-2 ring-white dark:ring-navy-800 ring-offset-0" : ""
      }`}
      style={{ backgroundColor: color }}
      title={username}
    >
      {getInitials(username)}
    </div>
  );
}