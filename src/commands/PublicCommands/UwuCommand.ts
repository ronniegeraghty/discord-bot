import Command from "../../client/Command";
import { Message, MessageEmbed } from "discord.js";

export default class UwuCommand extends Command {
  public constructor() {
    super("uwu", {
      aliases: ["uwu"],
      category: "Public Command",
      description: {
        content: "Shows you our server wifu",
        usage: "uwu",
        examples: ["uwu"],
      },
      ratelimit: 3,
    });
  }
  public execute(message: Message): Promise<Message> {
    return message.util.send(
      new MessageEmbed()
        .setTitle(`WIFU`)
        .setColor("#FFC0CB")
        .setImage(
          `https://pm1.narvii.com/5689/ac893cb77bc91c4f581500beb77b201f525078e5_hq.jpg`
        )
    );
  }
}
