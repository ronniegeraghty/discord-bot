import { SlashCommandBuilder } from "@discordjs/builders";
import { AudioPlayerStatus } from "@discordjs/voice";
import { CommandInteraction, CacheType } from "discord.js";
import BotClient from "../client/BotClient";
import { CommandAbs } from "../client/Command";

class ResumeCommand extends CommandAbs {
  public data = new SlashCommandBuilder()
    .setName("resume")
    .setDescription("Resume playing the current song.");
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
      } else if (
        subscription.audioPlayer.state.status === AudioPlayerStatus.Playing
      ) {
        await interaction.reply({
          content: "Music is already playing",
          ephemeral: true,
        });
        return;
      }
      subscription.audioPlayer.unpause();
      await interaction.reply("Music unpaused!");
    }
  }
}
export default new ResumeCommand();
