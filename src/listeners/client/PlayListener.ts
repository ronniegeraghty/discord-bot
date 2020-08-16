import { Listener } from "discord-akairo";
import { Message } from "discord.js";

export default class ReadyListener extends Listener {
  public constructor() {
    super("play", {
      emitter: "client",
      event: "play",
      category: "client",
    });
  }

  public exec(message: Message): void {
    console.log(`PLAY LISTENER:\nMESSAGE: ${message.content}`);
  }
}
