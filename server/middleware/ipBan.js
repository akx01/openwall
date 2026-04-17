// In-memory IP ban store (resets on server restart)
// For production: use Redis or MongoDB
const bannedIPs = new Map(); // ip → banExpiresAt

exports.ipBanMiddleware = (req, res, next) => {
  const ip = req.ip;
  const banExpiry = bannedIPs.get(ip);
  if (banExpiry && Date.now() < banExpiry) {
    const remaining = Math.ceil((banExpiry - Date.now()) / 60000);
    return res.status(403).json({ error: `You are temporarily banned. Try again in ${remaining} min.` });
  }
  next();
};

// Ban an IP for `minutes` minutes
exports.banIP = (ip, minutes = 30) => {
  bannedIPs.set(ip, Date.now() + minutes * 60 * 1000);
  console.log(`🚫 Banned IP ${ip} for ${minutes} minutes`);
};

exports.bannedIPs = bannedIPs;