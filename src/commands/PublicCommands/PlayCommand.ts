import Command from "../../client/Command";
import { Message, GuildMember } from "discord.js";
import ytdl from "ytdl-core";
import { Repository } from "typeorm";
import { MusicQueue } from "../../models/MusicQueue";

export default class PlayCommand extends Command {
  public constructor() {
    super("play", {
      aliases: ["play"],
      category: "Public Commands",
      description: {
        content: "Play music from youtube",
        useage: "play [ youtube link ]",
        examples: [
          "play https://www.youtube.com/watch?v=5aopMm7UGYA",
          "play https://www.youtube.com/watch?v=YjYHXGCFZWo",
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
    const musicQueueRepo: Repository<MusicQueue> = this.client.db.getRepository(
      MusicQueue
    );
    if (!url) {
      return message.util.send(`${message.member} you must include a link`);
    }
    if (!message.member.voice.channel) {
      return message.util.send(
        `${message.member} you must be in a voice channel to play music.`
      );
    }

    const videoTitle: string = (await ytdl.getBasicInfo(url.toString()))
      .videoDetails.title;

    await musicQueueRepo.insert({
      guild: message.guild.id,
      user: message.author.id,
      url: url,
      title: videoTitle,
    });

    this.client.emit("play", message, url);
  }
}
