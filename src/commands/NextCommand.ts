import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, CacheType, ButtonInteraction } from "discord.js";
import BotClient from "../client/BotClient";
import { CommandAbs } from "../client/Command";

export class NextCommand extends CommandAbs {
  public data = new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Skip to next song in the queue");
  public async execute(
    interaction: CommandInteraction<CacheType>
  ): Promise<void> {
    this.next(interaction);
  }
  public async next(interaction: CommandInteraction | ButtonInteraction) {
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
      //Calling .stop() on an AudioPlay causes it to transition into the Idle state. Because of a state transition
      // listener defined in client/Subscription.ts, transitions into the Idle state mean the next track from the queue
      // will be loaded and played.
      subscription.audioPlayer.stop();
      await interaction.reply("Skipped song.");
    }
  }
}

export default new NextCommand();
