import { SlashCommandBuilder } from "@discordjs/builders";
import { AudioPlayerStatus, AudioResource } from "@discordjs/voice";
import { ColorResolvable, CommandInteraction, MessageEmbed } from "discord.js";
import ytdl from "ytdl-core";
import BotClient from "../client/BotClient";
import { CommandAbs } from "../client/Command";
import Track from "../client/Track";

class QueueCommand extends CommandAbs {
  public data = new SlashCommandBuilder()
    .setName("queue")
    .setDescription("See all songs on the queue");
  public async execute(interaction: CommandInteraction) {
    //check if guild has a music subscription with a queue
    const { client, guildId } = interaction;
    if (client instanceof BotClient) {
      const subscription = client.subscriptions.get(guildId);
      if (
        !subscription ||
        (subscription.queue.length === 0 && !subscription.audioPlayer)
      ) {
        interaction.reply({
          content: "There is no music queued for this server.",
          ephemeral: true,
        });
        return;
      }
      // list of embed messages with songs in the queue
      let queueMsgEmbeds = [];
      // add the current song to the top of the queue
      switch (subscription.audioPlayer.state.status) {
        case AudioPlayerStatus.Playing:
          queueMsgEmbeds.push(
            await this.getSongEmbed(
              (subscription.audioPlayer.state.resource as AudioResource<Track>)
                .metadata,
              "Now Playing: "
            )
          );
          break;
        case AudioPlayerStatus.Paused:
          queueMsgEmbeds.push(
            await this.getSongEmbed(
              (subscription.audioPlayer.state.resource as AudioResource<Track>)
                .metadata,
              "Current Song: "
            )
          );
          break;
      }
      //gets songs on the subscription queue
      for (let track of subscription.queue) {
        queueMsgEmbeds.push(await this.getSongEmbed(track));
      }
      interaction.reply({
        content: "**Music Queue:**",
        embeds: queueMsgEmbeds,
      });
    }
  }
  private async getSongEmbed(
    track: Track,
    titlePrefix = ""
  ): Promise<MessageEmbed> {
    // Deside color for embed
    let color: ColorResolvable;
    switch (track.urlType) {
      case "youtube":
        color = "#FF0000";
        break;
      case "soundcloud":
        color = "#FF7700";
        break;
      default:
        color = "#FFFFFF";
        break;
    }
    return new MessageEmbed()
      .setTitle(`${titlePrefix}**${track.title}**`)
      .setColor(color)
      .setDescription(`Added By: ${track.userTag}`)
      .setThumbnail(
        (await ytdl.getBasicInfo(track.url)).videoDetails.thumbnails[0].url
      );
  }
}
export default new QueueCommand();
