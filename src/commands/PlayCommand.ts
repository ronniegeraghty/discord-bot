import { SlashCommandBuilder } from "@discordjs/builders";
import { GuildMember } from "discord.js";
import { CommandType } from "../client/Command";
import ytdl from "ytdl-core";
import scdl from "soundcloud-downloader";
import MusicQueue from "../database/schemas/MusicQueue";

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
    const { member } = interaction;
    if (member instanceof GuildMember) {
      if (!member.voice.channel) {
        interaction.reply({
          content: "You must be in a voice channel to play music.",
          ephemeral: true,
        });
        return;
      }
      //Add url to music queue
      const musicTitle: string = await getMusicTitle(url, urlType);
      const musicQueue = new MusicQueue({
        guildId: interaction.guildId,
        userId: interaction.user.id,
        url: url,
        title: musicTitle,
      });
      await musicQueue.save();
      interaction.reply("Bing-Bong");
    }
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
