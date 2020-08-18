import { Command } from "discord-akairo";
import { Message } from "discord.js";
import { helpVerbos } from "./HelpCommand";
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
      args: [
        {
          id: "help",
          match: "flag",
          flag: "-help",
        },
      ],
    });
  }

  public exec(message: Message, { help }: { help: boolean }): Promise<Message> {
    if (help) {
      return message.util.send(helpVerbos(this));
    }
    return message.util.send(`Pong! \`${this.client.ws.ping}ms\``);
  }
}
