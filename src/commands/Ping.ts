import { SlashCommandBuilder } from "@discordjs/builders";
import Command from "../client/Command";

const Ping: Command = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with pong, checks latency of server."),
  execute: async (interaction) => {
    if (interaction.isCommand()) {
      await interaction.reply(`Pong! - ${interaction.client.ws.ping}ms`);
    }
  },
};
export default Ping;
