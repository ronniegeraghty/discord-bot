import mongoose from "mongoose";

const guild = new mongoose.Schema({
  guildId: {
    type: String,
    unique: true,
  },
});

export default mongoose.model("Guild", guild);
