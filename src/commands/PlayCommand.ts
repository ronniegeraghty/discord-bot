import { SlashCommandBuilder } from "@discordjs/builders";
import {
  CommandInteraction,
  GuildMember,
  InteractionCollector,
  StageChannel,
  VoiceChannel,
} from "discord.js";
import { CommandType } from "../client/Command";
import ytdl from "ytdl-core";
import scdl from "soundcloud-downloader";
import BotClient from "../client/BotClient";
import MusicSubscription from "../client/Subscription";
import {
  entersState,
  joinVoiceChannel,
  VoiceConnectionStatus,
} from "@discordjs/voice";
import Track from "../client/Track";

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
    //Validate URL and get URL Type
    let url: string = interaction.options.getString("url");
    const urlType = getURLType(url);
    if (!urlType) {
      interaction.reply({ content: "Invalid URL", ephemeral: true });
      return;
    }
    //Check if user is in a voice channel
    const { member, client, guildId } = interaction;
    if (member instanceof GuildMember && client instanceof BotClient) {
      if (!member.voice.channel) {
        interaction.reply({
          content: "You must be in a voice channel to play music.",
          ephemeral: true,
        });
        return;
      }
      await interaction.deferReply();
      // get existing music subscription for server if one exisits
      let subscription = client.subscriptions.get(guildId);
      // If there is no connection to the guild create one
      if (!subscription) {
        const channel = member.voice.channel;
        subscription = new MusicSubscription(
          joinVoiceChannel({
            channelId: channel.id,
            guildId: guildId,
            adapterCreator: channel.guild.voiceAdapterCreator,
          })
        );
        subscription.voiceConnection.on("error", console.warn);
        client.subscriptions.set(guildId, subscription);
      }
      // Make sure the connection is ready before processing the user's request
      try {
        await entersState(
          subscription.voiceConnection,
          VoiceConnectionStatus.Ready,
          20e3
        );
      } catch (error) {
        console.warn(error);
        await interaction.followUp(
          "Failed to join voice channel within 20 seconds, please try again later. "
        );
        return;
      }

      try {
        // Attempt to create a Track from the user's video URL
        const track = await Track.from(url, {
          onStart() {
            interaction
              .followUp({ content: "Now playing!", ephemeral: true })
              .catch(console.warn);
          },
          onFinish() {
            interaction
              .followUp({ content: "Now Finished!", ephemeral: true })
              .catch(console.warn);
          },
          onError(error) {
            console.warn(error);
            interaction
              .followUp({ content: `Error: ${error}`, ephemeral: true })
              .catch(console.warn);
          },
        });
        subscription.enqueue(track);
        await interaction.followUp(`Enqueued **${track.title}**`);
      } catch (error) {
        console.warn(error);
        await interaction.followUp(
          `Failed to play track, please try again later!`
        );
      }
    }
    interaction.followUp("Bing-Bong");
  },
};
export default PlayCommand;

function getURLType(url: string): string {
  let endIndex: number = findUrlEndPoint(url);
  switch (url.substring(0, endIndex)) {
    case "https://www.youtube":
      return "youtube";
    case "https://youtu":
      return "youtube";
    case "https://soundcloud":
      return "soundcloud";
    default:
      return null;
  }
}
function findUrlEndPoint(url: string): number {
  const endPointList = [".com", ".be"];
  for (let endPoint of endPointList) {
    const endPointIndex = url.toString().indexOf(endPoint);
    if (endPointIndex) {
      return endPointIndex;
    }
  }
  return 0;
}
async function getMusicTitle(url: string, urlType: string): Promise<string> {
  try {
    switch (urlType) {
      case "youtube":
        return (await ytdl.getBasicInfo(url)).videoDetails.title;
      case "soundcloud":
        return (await scdl.getInfo(url)).title;
    }
  } catch (error) {
    console.log(`Error getting music title: ${error}`);
    return null;
  }
}
function hasPermissons(
  interaction: CommandInteraction,
  voiceChannel: VoiceChannel | StageChannel
): string {
  const permissions = voiceChannel.permissionsFor(interaction.client.user);
  if (!permissions.has("CONNECT")) {
    return "I need the permissions to join your voice channel!";
  } else if (!permissions.has("SPEAK")) {
    return "I need permission to speak in your voice channel!";
  }
  return null;
}
