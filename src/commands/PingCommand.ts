import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../client/Command";

// export default new Command({
//   name: "ping",
//   description: "Replies with pong, checks latency of server.",
//   execute: async (interaction) => {
//     await interaction.reply(`Pong! - ${interaction.client.ws.ping}ms`);
//   },
// });

class PingCommand extends Command {
  public data = new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with pong, checks latency of server.');
  public execute = async (interaction: CommandInteraction) => {
    await interaction.reply(`Pong! - ${interaction.client.ws.ping}ms`);
  };
}
export default new PingCommand();