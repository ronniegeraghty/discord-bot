import Command from "../../client/Command";
import { Message } from "discord.js";

export default class PingCommand extends Command {
  public constructor() {
    super("ping", {
      aliases: ["ping"],
      category: "Public Command",
      description: {
        content: "Check the latency of the ping to the Discord API",
        usage: "ping",
        examples: ["ping"],
      },
      ratelimit: 3,
    });
  }

  public execute(message: Message): Promise<Message> {
    return message.util.send(`Pong! \`${this.client.ws.ping}ms\``);
  }
}
