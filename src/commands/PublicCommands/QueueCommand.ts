import { Command } from "discord-akairo";
import { Message, GuildMember, MessageEmbed } from "discord.js";
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
          match: "flag",
          flag: "clear",
        },
      ],
    });
  }

  public async exec(
    message: Message,
    { clear }: { clear: boolean }
  ): Promise<Message> {
    const musicQueueRepo: Repository<MusicQueue> = this.client.db.getRepository(
      MusicQueue
    );
    if (clear) {
      musicQueueRepo
        .delete({
          guild: message.guild.id,
        })
        .then(() => {
          return message.util.reply(`The queue has been cleared.`);
        });
    } else {
      const musicQueue: MusicQueue[] = await musicQueueRepo.find({
        guild: message.guild.id,
      });
      if (!musicQueue.length) return message.util.reply("The queue is empty");
      return message.util.send(
        new MessageEmbed()
          .setAuthor(`Music Queue:`)
          .setColor("#f44336")
          .setDescription(
            musicQueue.map(
              (v, i) => `#${i + 1} ${v.title}\n${v.url.toString()}\n`
            )
          )
      );
    }
  }
}
