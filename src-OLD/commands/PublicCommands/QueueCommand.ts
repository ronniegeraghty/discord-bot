import Command from "../../client/Command";
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
        flags: [`**-clear** will clear the queue`],
        examples: ["queue", "queue -clear"],
      },
      ratelimit: 3,
      args: [
        {
          id: "clear",
          match: "flag",
          flag: "-clear",
        },
      ],
    });
  }

  public async execute(
    message: Message,
    { clear }: { clear: boolean }
  ): Promise<Message> {
    //Get the MusicQueueRepo
    const musicQueueRepo: Repository<MusicQueue> = this.client.db.getRepository(
      MusicQueue
    );
    //If clear flag, clear the music queue for this discord server and send reply
    if (clear) {
      musicQueueRepo
        .delete({
          guild: message.guild.id,
        })
        .then(() => {
          return message.util.reply(`The queue has been cleared.`);
        });
    }
    //If no flag send reply with the current queue
    else {
      const musicQueue: MusicQueue[] = await musicQueueRepo.find({
        guild: message.guild.id,
      });
      //If queue is emtpy send reply
      if (!musicQueue.length) return message.util.reply("The queue is empty");
      //If queue has songs, send reply with songs
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
