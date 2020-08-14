import { Command } from "discord-akairo";
import { Message, GuildMember } from "discord.js";
import { Repository } from "typeorm";
import { MusicQueue } from "../../models/MusicQueue";

export default class QueueCommand extends Command {
  public constructor() {
    super("queue", {
      aliases: ["queue"],
      category: "Public Commands",
      description: {
        content: "Check the songs in the queue",
        usage: "queue",
        examples: ["queue"],
      },
      ratelimit: 3,
      args: [
        {
          id: "clear",
          default: false,
          match: "flag",
          flag: "clear",
        },
      ],
    });
  }

  public async exec(
    message: Message,
    { clear }: { clear: boolean }
  ): Promise<Message> {}
}
