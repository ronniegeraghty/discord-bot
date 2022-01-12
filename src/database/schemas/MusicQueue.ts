import mongoose from "mongoose";

const musicQueue = new mongoose.Schema({
  guildId: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now(),
  },
});

export default mongoose.model("MusicQueue", musicQueue);
export interface MusicQueueInterface {
  guildId: string;
  userId: string;
  url: string;
  title: string;
  date: Date;
}
