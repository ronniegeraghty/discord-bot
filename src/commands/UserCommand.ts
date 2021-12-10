import { SlashCommandBuilder } from "@discordjs/builders";
import { Interaction, MessageActionRow, MessageEmbed } from "discord.js";
import { CommandAbs } from "../client/Command";

class UserCommand extends CommandAbs {
  public data = new SlashCommandBuilder()
    .setName("user")
    .setDescription("Replies with user info.");
  public async execute(interaction: Interaction): Promise<void> {
    if (interaction.isCommand()) {
      const embed = new MessageEmbed()
        .setColor("DARK_GREEN")
        .setTitle(interaction.user.tag)
        .setImage(interaction.user.avatarURL());
      await interaction.reply({ embeds: [embed] });
    }
  }
}
export default new UserCommand();
