import { Listener } from "discord-akairo";
import { Message } from "discord.js";
import discordPlaysPokemon from "./messageListeners/DiscordPlaysPokemon";
export default class MessageListener extends Listener {
  public constructor() {
    super("message", {
      emitter: "client",
      event: "message",
      category: "client",
    });
  }

  public exec(message: Message) {
    let channel = message.channel;
    //If message is from a text channel
    if (channel.type === "text") {
      //If discord text channel is named "discord-plays-pokemon"
      if (channel.name === "discord-plays-pokemon") {
        return discordPlaysPokemon(this, message);
      }
    }
  }
}
