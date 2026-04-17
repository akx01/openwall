require("dotenv").config();
const mongoose = require("mongoose");
const Room = require("./models/Room");

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  const defaults = [
    { name: "global", description: "The main public room", isSystem: true, createdBy: "system" },
    { name: "random", description: "Anything goes", isSystem: true, createdBy: "system" },
    { name: "writing", description: "Share your writing", isSystem: true, createdBy: "system" },
    { name: "ideas", description: "Drop your ideas", isSystem: true, createdBy: "system" },
  ];
  for (const r of defaults) {
    await Room.findOneAndUpdate({ name: r.name }, r, { upsert: true });
  }
  console.log("✅ Rooms seeded");
  process.exit(0);
}

seed();