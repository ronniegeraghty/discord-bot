import { Message } from "discord.js";
import DisTube from "distube";
import { RawCommand } from "../client/Command";
const prefix = process.env.PREFIX;

class PlayRawCommand extends RawCommand {
  public constructor() {
    super("play");
  }
  async execute(message: Message<boolean>): Promise<void> {
    const args = message.content.slice(prefix.length).trim().split(" ");
    const distube = new DisTube(message.client);
    distube.play(message, args.join(" "));
  }
}

export default new PlayRawCommand();
