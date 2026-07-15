import {
  ChatInputCommandInteraction,
  Colors,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";
import { CommandAbs } from "../client/Command";

class UserCommand extends CommandAbs {
  public data = new SlashCommandBuilder()
    .setName("user")
    .setDescription("Replies with user info.");
  public async execute(
    interaction: ChatInputCommandInteraction
  ): Promise<void> {
    const embed = new EmbedBuilder()
      .setColor(Colors.DarkGreen)
      .setTitle(interaction.user.tag)
      .setImage(interaction.user.avatarURL());
    await interaction.reply({ embeds: [embed] });
  }
}
export default new UserCommand();
