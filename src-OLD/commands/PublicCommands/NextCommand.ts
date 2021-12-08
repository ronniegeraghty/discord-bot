import Command from "../../client/Command";
import { Message, VoiceChannel, StreamDispatcher } from "discord.js";
import { Repository } from "typeorm";
import { MusicQueue } from "../../models/MusicQueue";

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
    // Make sure member is in the voice channel, if not send reply
    if (!message.member.voice.channel) {
      message.util.reply(`You must be in a voice channel to use this command`);
    }
    //Get MusicQueueRepo
    const musicQueueRepo: Repository<MusicQueue> =
      this.client.db.getRepository(MusicQueue);
    //Find the music queue for the guild id (server)
    const musicQueue: MusicQueue[] = await musicQueueRepo.find({
      guild: message.guild.id,
    });
    //Check if queue is empty, if so send reply
    if (!musicQueue.length) return message.util.reply("The queue is empty.");
    //delete the first song in the queue
    await musicQueueRepo.delete(musicQueue[0]);
    //Get Dispatcher for the voice channel
    let dispatcher = this.client.getDispatcher(message.member.voice.channel);
    //Check if there is a dispatcher, if not send reply
    if (!dispatcher)
      return message.util.reply(`Nothing is playing in your voice channel`);
    else {
      //remove the dispatcher from client's dispatcher array
      this.client.dispatchers = this.client.dispatchers.filter(
        (disp) => disp.channel.id !== message.member.voice.channel.id
      );
      //Destroy the dispatcher
      dispatcher.destroy();
    }
    //If there is not next sound in the queue send reply
    if (musicQueue.length === 1)
      return message.util.reply("You have reached the end of the queue");

    //emit play to play the next song in the queue
    this.client.emit("play", message);
  }
}
