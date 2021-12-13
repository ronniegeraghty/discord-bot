import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandType } from "../client/Command";

const PlayCommand: CommandType = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play music in a voice channel.")
    .addStringOption((option) =>
      option
        .setName("url")
        .setDescription("A valid youtube or soundcloud url.")
        .setRequired(true)
    ),
  async execute(interaction) {
    console.log(`URL: ${interaction.options.getString("url")}`);
  },
};
export default PlayCommand;
