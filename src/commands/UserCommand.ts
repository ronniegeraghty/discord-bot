import { SlashCommandBuilder } from "@discordjs/builders";
import { Interaction } from "discord.js";
import { CommandAbs } from "../client/Command";

class UserCommand extends CommandAbs {
  public data = new SlashCommandBuilder()
    .setName("user")
    .setDescription("Replies with user info.");
  public async execute(interaction: Interaction): Promise<void> {
    if (interaction.isCommand()) {
      await interaction.reply(
        `Your tag: ${interaction.user.tag}\nYour id: ${interaction.user.id}`
      );
    }
  }
}
export default new UserCommand();
