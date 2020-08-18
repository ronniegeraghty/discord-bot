import { Listener } from "discord-akairo";
import { Message, StreamDispatcher, VoiceChannel } from "discord.js";
import BotClient from "../../client/BotClient";
import ytdl from "ytdl-core";
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
    console.log(`PLAY LISTENER: MESSAGE: ${message.content}`);
    //Get the music queue.
    const musicQueueRepo: Repository<MusicQueue> = this.client.db.getRepository(
      MusicQueue
    );
    const musicQueue: MusicQueue[] = await musicQueueRepo.find({
      guild: message.guild.id,
    });
    //Get the dispatcher for voice channel if there is one.
    let dispatcher = this.getDispatcher(message.member.voice.channel);
    //If there was no dispatcher for voice channel create one.
    if (!dispatcher) {
      message.member.voice.channel.join().then((connection) => {
        dispatcher = connection.play(
          ytdl(musicQueue[0].url.toString(), { filter: "audioonly" })
        );
        //If new dispatcher, add to client.dispatchers
        this.client.dispatchers.push({
          streamDispatcher: dispatcher,
          channel: message.member.voice.channel,
        });
        dispatcher.on("speaking", async (speaking) => {
          if (!speaking) {
            await musicQueueRepo.delete(musicQueue[0]);
            this.client.emit("play", message);
          }
        });
      });
    } else {
      //If dispatcher exists then see if it is playing or paused
      let paused = dispatcher.paused;
      console.log(`PAUSED: ${paused}`);
    }

    //If playing do nothing
    //If paused.

    // let dispatcherArray = this.client.dispatchers.filter(
    //   (disp) => disp.channel.id === message.member.voice.channel.id
    // );
    // const musicQueueRepo: Repository<MusicQueue> = this.client.db.getRepository(
    //   MusicQueue
    // );
    // const musicQueue: MusicQueue[] = await musicQueueRepo.find({
    //   guild: message.guild.id,
    // });
    // if (!dispatcherArray.length) {
    //   message.member.voice.channel.join().then((connection) => {

    //   });
    // }
  }

  private getDispatcher(channel: VoiceChannel): StreamDispatcher | null {
    let dispatcher: StreamDispatcher;
    this.client.dispatchers.forEach((disp) => {
      if (disp.channel.id === channel.id) dispatcher = disp.streamDispatcher;
    });
    return dispatcher;
  }
}
