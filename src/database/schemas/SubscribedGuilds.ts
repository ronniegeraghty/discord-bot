import mongoose from "mongoose";

const subscribedGuild = new mongoose.Schema({
  guildId: {
    type: String,
    unique: true,
  },
});

export default mongoose.model("SubscribedGuild", subscribedGuild);

export interface SubscribedGuildInterface {
  guildId: string;
}
