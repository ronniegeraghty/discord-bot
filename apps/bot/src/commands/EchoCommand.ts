import { SlashCommandBuilder } from "discord.js";
import { CommandType } from "../client/Command";

const EchoCommand: CommandType = {
  data: new SlashCommandBuilder()
    .setName("echo")
    .setDescription("Replies with your input")
    .addStringOption((option) =>
      option
        .setName("input")
        .setDescription("The input to echo back")
        .setRequired(true)
    ),
  async execute(interaction) {
    if (interaction.isCommand()) {
      await interaction.reply(
        `Your input: ${interaction.options.getString("input")} `
      );
    }
  },
};
export default EchoCommand;
