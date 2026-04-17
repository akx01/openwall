// Tracks who is in which room in memory
const rooms = new Map(); // roomName → Set of { socketId, username, color }

exports.joinRoom = (roomName, user) => {
  if (!rooms.has(roomName)) rooms.set(roomName, new Map());
  rooms.get(roomName).set(user.socketId, user);
};

exports.leaveRoom = (roomName, socketId) => {
  if (rooms.has(roomName)) {
    rooms.get(roomName).delete(socketId);
  }
};

exports.leaveAllRooms = (socketId) => {
  for (const [roomName, members] of rooms) {
    if (members.has(socketId)) {
      members.delete(socketId);
    }
  }
};

exports.getRoomMembers = (roomName) => {
  return rooms.has(roomName) ? [...rooms.get(roomName).values()] : [];
};

exports.getMemberCount = (roomName) => {
  return rooms.has(roomName) ? rooms.get(roomName).size : 0;
};

exports.getTotalOnline = () => {
  const seen = new Set();
  for (const members of rooms.values()) {
    for (const socketId of members.keys()) seen.add(socketId);
  }
  return seen.size;
};