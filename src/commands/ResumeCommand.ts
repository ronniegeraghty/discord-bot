import { AudioPlayerStatus } from "@discordjs/voice";
import {
  ButtonInteraction,
  CacheType,
  ChatInputCommandInteraction,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";
import BotClient from "../client/BotClient";
import { CommandAbs } from "../client/Command";

export class ResumeCommand extends CommandAbs {
  public data = new SlashCommandBuilder()
    .setName("resume")
    .setDescription("Resume playing the current song.");
  public async execute(
    interaction: ChatInputCommandInteraction<CacheType>
  ): Promise<void> {
    this.resume(interaction);
  }
  public async resume(
    interaction: ChatInputCommandInteraction | ButtonInteraction
  ) {
    //get client and make do type check to get subscriptions
    const { client } = interaction;
    if (client instanceof BotClient) {
      const subscription = client.subscriptions.get(interaction.guildId);
      // if no subscription we are not playing music in the channel
      if (!subscription) {
        await interaction.followUp({
          content:
            "There is no music playing in this server. Use /play to start playing music.",
          flags: MessageFlags.Ephemeral,
        });
        return;
      } else if (
        subscription.audioPlayer.state.status === AudioPlayerStatus.Playing
      ) {
        await interaction.followUp({
          content: "Music is already playing",
          flags: MessageFlags.Ephemeral,
        });
        return;
      }
      subscription.audioPlayer.unpause();
      await interaction.reply("Music unpaused!");
    }
  }
}
export default new ResumeCommand();
