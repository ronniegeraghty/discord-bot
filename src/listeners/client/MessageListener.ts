import { Listener } from "discord-akairo";
import { Message } from "discord.js";

export default class MessageListener extends Listener {
  public constructor() {
    super("messageCreate", {
      emitter: "client",
      event: "messageCreate",
      category: "client",
    });
  }

  public exec(message: Message) {
    console.log(`⭐ Server: ${message.guild.name}`);
  }
}
