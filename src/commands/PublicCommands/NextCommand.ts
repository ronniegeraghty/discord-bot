import Command from "../../client/Command";
import { Message, VoiceChannel, StreamDispatcher } from "discord.js";
import { Repository } from "typeorm";
import { MusicQueue } from "../../models/MusicQueue";
import { memory } from "console";

export default class NextCommand extends Command {
  public constructor() {
    super("next", {
      aliases: ["next", "skip"],
      category: "Public Commands",
      description: {
        content: "Skip to the next sond in the queue",
        usage: "next",
        examples: ["next", "skip"],
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
    const musicQueueRepo: Repository<MusicQueue> = this.client.db.getRepository(
      MusicQueue
    );
    const musicQueue: MusicQueue[] = await musicQueueRepo.find({
      guild: message.guild.id,
    });
    if (!musicQueue.length) return message.util.reply("The queue is empty.");
    await musicQueueRepo.delete(musicQueue[0]);
    //Delete the dispatcher
    let dispatcher = this.client.getDispatcher(message.member.voice.channel);
    if (!dispatcher)
      return message.util.reply(`Nothing is playing in your voice channel`);
    else {
      this.client.dispatchers = this.client.dispatchers.filter(
        (disp) => disp.channel.id !== message.member.voice.channel.id
      );
      dispatcher.destroy();
    }
    //emit play
    this.client.emit("play", message);
    if (musicQueue.length === 1)
      return message.util.reply("You have reached the end of the queue");
  }
}
