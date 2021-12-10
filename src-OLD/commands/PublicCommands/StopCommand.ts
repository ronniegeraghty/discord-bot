import Command from "../../client/Command";
import { Message, VoiceChannel, StreamDispatcher } from "discord.js";
import { Repository } from "typeorm";
import { MusicQueue } from "../../models/MusicQueue";

export default class StopCommand extends Command {
  public constructor() {
    super("stop", {
      aliases: ["stop"],
      category: "Public Commands",
      description: {
        content:
          "Stop the music playback. Differs from pause since it also removes the current song from the queue",
        usage: "stop",
        examples: ["stop"],
      },
      ratelimit: 3,
    });
  }

  public async execute(message: Message): Promise<Message> {
    // Make sure member is in the voice channel
    if (!message.member.voice.channel) {
      message.util.reply(`You must be in a voice channel to use this command`);
    }
    //Delete top song off music queue
    //Get the musicQueueRepo
    const musicQueueRepo: Repository<MusicQueue> = this.client.db.getRepository(
      MusicQueue
    );
    //Get the music Queue for this discord server
    const musicQueue: MusicQueue[] = await musicQueueRepo.find({
      guild: message.guild.id,
    });
    //If queue is empty send reply
    if (!musicQueue.length) return message.util.reply("The queue is empty.");
    //If not empty delete the first song
    await musicQueueRepo.delete(musicQueue[0]);
    //Delete the dispatcher
    //Get the dispatcher
    let dispatcher = this.client.getDispatcher(message.member.voice.channel);
    //If no Dispatcher send reply
    if (!dispatcher)
      return message.util.reply(`Nothing is playing in your voice channel`);
    else {
      //Delete the dispatcher from Bot list of dispatchers
      this.client.dispatchers = this.client.dispatchers.filter(
        (disp) => disp.channel.id !== message.member.voice.channel.id
      );
      //Delete dispatcher
      dispatcher.destroy();
    }
    //If at that was the last song in the queue send a reply
    if (musicQueue.length === 1)
      return message.util.reply("You have reached the end of the queue");
  }
}
