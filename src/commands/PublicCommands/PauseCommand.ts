import Command from "../../client/Command";
import { Message } from "discord.js";
import { VoiceChannel, StreamDispatcher } from "discord.js";

export default class PauseCommand extends Command {
  public constructor() {
    super("pause", {
      aliases: ["pause"],
      category: "Public Commands",
      description: {
        content: "Pause the music",
        usage: "pause",
        examples: ["pause"],
      },
      ratelimit: 3,
    });
  }
  public execute(message: Message): Promise<Message> {
    //Get dispatcher for current voice channel
    let dispatcher = this.client.getDispatcher(message.member.voice.channel);
    //If no dispatcher found, send reply
    if (!dispatcher)
      return message.util.reply(
        `Either no music is playing or you are not in a voice channel where music is playing.`
      );
    //If there is a dispatcher, pause it.
    else {
      dispatcher.pause(true);
    }
  }
}
