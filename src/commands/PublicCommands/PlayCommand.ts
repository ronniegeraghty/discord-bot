import Command from "../../client/Command";
import { Message } from "discord.js";
import ytdl from "ytdl-core";
import { Repository } from "typeorm";
import { MusicQueue } from "../../models/MusicQueue";

export default class PlayCommand extends Command {
  public constructor() {
    super("play", {
      aliases: ["play"],
      category: "Public Commands",
      description: {
        content: "Play music from youtube, or resume the paused music",
        useage: "play [ youtube link ]",
        examples: [
          "play https://www.youtube.com/watch?v=5aopMm7UGYA",
          "play https://www.youtube.com/watch?v=YjYHXGCFZWo",
          "play",
        ],
      },
      ratelimit: 3,
      args: [
        {
          id: "url",
          type: "url",
          match: "rest",
        },
      ],
    });
  }
  public async execute(
    message: Message,
    { url }: { url: URL }
  ): Promise<Message> {
    //Get the Music Queue Repo
    const musicQueueRepo: Repository<MusicQueue> = this.client.db.getRepository(
      MusicQueue
    );
    //Get the music queue for current discord server
    const musicQueue: MusicQueue[] = await musicQueueRepo.find({
      guild: message.guild.id,
    });
    //If no link included and their is no songs in the queue send reply
    if (!url && !musicQueue.length) {
      return message.util.send(`${message.member} you must include a link`);
    }
    //If member not in a voice channel send reply
    if (!message.member.voice.channel) {
      return message.util.send(
        `${message.member} you must be in a voice channel to play music.`
      );
    }
    //If a link was included add it to the MusicQueue
    if (url) {
      const videoTitle: string = (await ytdl.getBasicInfo(url.toString()))
        .videoDetails.title;
      //insert song into music queue
      await musicQueueRepo.insert({
        guild: message.guild.id,
        user: message.author.id,
        url: url,
        title: videoTitle,
      });
    }
    //emit play event
    this.client.emit("play", message);
  }
}
