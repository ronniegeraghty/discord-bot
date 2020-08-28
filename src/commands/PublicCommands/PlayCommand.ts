import Command from "../../client/Command";
import { Message } from "discord.js";
import ytdl from "ytdl-core";
import scdl from "soundcloud-downloader";
import { Repository } from "typeorm";
import { MusicQueue } from "../../models/MusicQueue";

export default class PlayCommand extends Command {
  public constructor() {
    super("play", {
      aliases: ["play"],
      category: "Public Commands",
      description: {
        content:
          "Play music from youtube and soundcloud, or resume the paused music",
        useage: "play [ youtube link ]",
        examples: ["play <youtube_or_soundcloud_link>", "play"],
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
      let urlType: string = this.getURLType(url);
      let musicTitle: string;
      if (urlType === "youtube") {
        musicTitle = (await ytdl.getBasicInfo(url.toString())).videoDetails
          .title;
      }
      if (urlType === "soundcloud") {
        musicTitle = (await scdl.getInfo(url.toString())).title;
      }
      //insert song into music queue
      await musicQueueRepo.insert({
        guild: message.guild.id,
        user: message.author.id,
        url: url,
        title: musicTitle,
      });
    }
    //emit play event
    this.client.emit("play", message);
  }
  public getURLType(url: URL): string {
    let urlString: string = url.toString();
    let comIndex: number = urlString.indexOf(".com");
    switch (urlString.substring(0, comIndex)) {
      case "https://www.youtube":
        return "youtube";
      case "https://soundcloud":
        return "soundcloud";
      default:
        return null;
    }
  }
}
