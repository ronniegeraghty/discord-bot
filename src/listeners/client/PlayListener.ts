import { Listener } from "discord-akairo";
import { Message, StreamDispatcher, VoiceChannel } from "discord.js";
import BotClient from "../../client/BotClient";
import ytdl from "ytdl-core";
import scdl from "soundcloud-downloader";
import { AkairoClient } from "discord-akairo";
import { MusicQueue } from "../../models/MusicQueue";
import { Repository } from "typeorm";
import { Speaking } from "discord.js";

export default class ReadyListener extends Listener {
  public constructor() {
    super("play", {
      emitter: "client",
      event: "play",
      category: "client",
    });
  }

  public async exec(message: Message): Promise<void> {
    //Get the music queue Repo.
    const musicQueueRepo: Repository<MusicQueue> = this.client.db.getRepository(
      MusicQueue
    );
    //Get the music queue
    const musicQueue: MusicQueue[] = await musicQueueRepo.find({
      guild: message.guild.id,
    });
    //Get the dispatcher for voice channel if there is one.
    let dispatcher: StreamDispatcher = this.client.getDispatcher(
      message.member.voice.channel
    );
    //If there was no dispatcher for voice channel create one.
    if (!dispatcher) {
      //If music queue is empty stop
      if (!musicQueue.length) return;
      //Connect to voice channel, play audio and add dispatcher to list
      message.member.voice.channel.join().then(async (connection) => {
        let urlType: string = this.getURLType(musicQueue[0].url);
        if (urlType === "youtube") {
          dispatcher = connection.play(
            ytdl(musicQueue[0].url.toString(), { filter: "audioonly" })
          );
        }
        if (urlType === "soundcloud") {
          await scdl.download(musicQueue[0].url.toString()).then((stream) => {
            dispatcher = connection.play(stream);
          });
        }

        //If new dispatcher, add to client.dispatchers
        this.client.dispatchers.push({
          streamDispatcher: dispatcher,
          channel: message.member.voice.channel,
        });
        //If dispatcher is not speaking and not paused then the song is over.
        dispatcher.on("speaking", async (speaking) => {
          // console.log(`SPEAKING : ${speaking}`);
          // console.log(`PAUSED: ${dispatcher.paused}`);
          if (!speaking && !dispatcher.paused) {
            await musicQueueRepo.delete(musicQueue[0]);
            this.client.dispatchers = this.client.dispatchers.filter(
              (disp) => disp.channel.id !== message.member.voice.channel.id
            );
            this.client.emit("play", message);
          }
        });
      });
    } else {
      //If dispatcher exists then see if it is playing or paused
      let paused = dispatcher.paused;
      if (paused) {
        dispatcher.resume();
      }
    }
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
