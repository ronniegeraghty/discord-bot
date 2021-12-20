import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, CacheType } from "discord.js";
import BotClient from "../client/BotClient";
import { CommandAbs } from "../client/Command";

class LeaveCommand extends CommandAbs {
  public data = new SlashCommandBuilder()
    .setName("leave")
    .setDescription("Leave the voice channel.");
  public async execute(
    interaction: CommandInteraction<CacheType>
  ): Promise<void> {
    //get client and make do type check to get subscriptions
    const { client } = interaction;
    if (client instanceof BotClient) {
      const subscription = client.subscriptions.get(interaction.guildId);
      // if no subscription we are not playing music in the channel
      if (!subscription) {
        await interaction.reply({
          content:
            "There is no music palying in this server. Use /play to start playing music.",
          ephemeral: true,
        });
        return;
      }
      subscription.voiceConnection.destroy();
      client.subscriptions.delete(interaction.guildId);
      await interaction.reply(`${client.user.tag} left voice channel!`);
    }
  }
}
export default new LeaveCommand();
