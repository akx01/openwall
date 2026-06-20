import { useEffect, useState } from "react";
import socket from "../../socket";
import Avatar from "./Avatar";

export default function OnlinePresence() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const handler = (list) => setUsers(list.slice(0, 8));
    socket.on("online_users", handler);
    socket.emit("request_online_users");
    return () => socket.off("online_users", handler);
  }, []);

  if (users.length === 0) return null;

  return (
    <div className="hidden sm:flex items-center gap-1.5">
      <div className="flex items-center">
        {users.map((u, i) => (
          <div
            key={u.socketId || i}
            className="presence-avatar relative"
            style={{ zIndex: users.length - i }}
            title={u.username}
          >
            <Avatar username={u.username} color={u.color} size="xs" />
          </div>
        ))}
      </div>
      <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium whitespace-nowrap">
        {users.length} online
      </span>
    </div>
  );
}
