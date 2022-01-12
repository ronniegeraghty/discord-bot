import { SlashCommandBuilder } from "@discordjs/builders";
import {
  ButtonInteraction,
  CommandInteraction,
  GuildMember,
  Interaction,
  InteractionCollector,
  MessageActionRow,
  MessageButton,
  MessageButtonStyleResolvable,
} from "discord.js";
import { CommandType } from "../client/Command";
import BotClient from "../client/BotClient";
import MusicSubscription from "../client/Subscription";
import {
  entersState,
  joinVoiceChannel,
  VoiceConnectionStatus,
} from "@discordjs/voice";
import { ResumeCommand } from "./ResumeCommand";
import { PauseCommand } from "./PauseCommand";
import { NextCommand } from "./NextCommand";
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
    //Get URL Option
    let url: string = interaction.options.getString("url");
    //Extract properties of interaction to consts
    const { member, client, guildId } = interaction;
    //Type check on member and client
    if (member instanceof GuildMember && client instanceof BotClient) {
      //Check if user is in a voice channel
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
        subscription = createSubscription(member, guildId, client);
      }
      // Make sure the connection is ready before processing the user's request
      // If not ready return
      if (!(await checkVoiceConnectionReady(subscription, interaction))) return;

      // Attempt to create a Track from the user's video URL
      const track = await createTrack(url, interaction);
      //Add track to the queue
      subscription.enqueue(track);
      // Send Queued follow up message
      sendQueuedMessage(interaction, track);
    }
  },
};
export default PlayCommand;

function createSubscription(
  member: GuildMember,
  guildId: string,
  client: BotClient
) {
  const channel = member.voice.channel;
  const subscription = new MusicSubscription(
    joinVoiceChannel({
      channelId: channel.id,
      guildId: guildId,
      adapterCreator: channel.guild.voiceAdapterCreator,
    })
  );
  subscription.voiceConnection.on("error", console.warn);
  // Add new connection to the subscribtions collection on the client
  client.subscriptions.set(guildId, subscription);
  return subscription;
}
async function checkVoiceConnectionReady(
  subscription: MusicSubscription,
  interaction: CommandInteraction
): Promise<boolean> {
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
    return false;
  }
  return true;
}
async function createTrack(
  url: string,
  interaction: CommandInteraction
): Promise<Track> {
  try {
    const track = await Track.from(url, interaction.user.tag, {
      onStart() {
        //send follow up that music is playing with playback buttons
        interaction
          .followUp({
            content: `Now playing ${track.title}!`,
            ephemeral: true,
          })
          .catch(console.warn);
      },
      onFinish() {
        // no need for follow up message on finish.
      },
      onError(error) {
        console.warn(error);
        interaction
          .followUp({ content: `Error: ${error}`, ephemeral: true })
          .catch(console.warn);
      },
    });
    return track;
  } catch (error) {
    console.warn(` - Warn Error: ${error}`);
    await interaction.followUp(
      `Failed to play track. Reason: ${error}\nPlease try again later!`
    );
    return undefined;
  }
}
type PlaybackButtonType = {
  [id: string]: {
    customId: string;
    style: MessageButtonStyleResolvable;
    emojiName: string;
  };
};
async function sendQueuedMessage(
  interaction: CommandInteraction,
  track: Track
) {
  //create playback buttons
  const playbackButtons: PlaybackButtonType = {
    play: {
      customId: "play",
      style: "PRIMARY",
      emojiName: "play",
    },
    pause: {
      customId: "pause",
      style: "PRIMARY",
      emojiName: "pause",
    },
    next: {
      customId: "next",
      style: "PRIMARY",
      emojiName: "next",
    },
  };
  const buttons = createPlakbackButtons(playbackButtons, interaction);
  await interaction.followUp({
    content: `Queued **${track.title}**`,
    components: [buttons],
  });
  //create button interaction collector
  createButtonInteractionCollector(interaction, playbackButtons);
}
function createPlakbackButtons(
  playbackButtons: PlaybackButtonType,
  interaction: CommandInteraction
) {
  return new MessageActionRow().addComponents(
    Object.keys(playbackButtons).map((key) =>
      new MessageButton()
        .setCustomId(key)
        .setLabel("")
        .setStyle(playbackButtons[key].style)
        .setEmoji(
          `${
            interaction.client.emojis.cache.find(
              (emoji) => emoji.name === playbackButtons[key].emojiName
            ).id
          }`
        )
    )
  );
}
function createButtonInteractionCollector(
  interaction: CommandInteraction,
  playbackButton: PlaybackButtonType
) {
  //extract needed properties from interaction
  const { guildId, channelId, client } = interaction;
  //type Check on properties
  if (!(client instanceof BotClient)) {
    console.warn(` - Client not instance of BotCleint`);
    return;
  }
  // Check if channel has message collector for playback buttons already, if so return
  if (client.collectors.has(`${guildId}.${channelId}.PlayPauseNextButton`))
    return;
  // Create filter for the collector
  const filter = (i: ButtonInteraction) => i.customId in playbackButton;
  // Create collector
  const collector: InteractionCollector<Interaction> =
    interaction.channel.createMessageComponentCollector({ filter });
  // Add collector to client collectors collection
  client.collectors.set(
    `${guildId}.${channelId}.PlayPauseNextButton`,
    collector
  );
  // Add on "collect" event listener to the collector
  collector.on("collect", async (i) => {
    if (i instanceof ButtonInteraction) {
      console.log(
        `Collector Triggered: ${i.user.tag} triggered Collector: ${
          i.customId
        } on Server: ${i.guild.name} in channel #${
          i.guild.channels.cache.get(i.channelId).name
        }`
      );
      if (i.isButton()) {
        handlePlayBackButton(i);
      }
    }
  });
}
function handlePlayBackButton(i: ButtonInteraction) {
  if (i.client instanceof BotClient) {
    switch (i.customId) {
      case "play":
        const resumeCommand = i.client.commands.get("resume");
        if (resumeCommand instanceof ResumeCommand) {
          resumeCommand.resume(i);
        }
        break;
      case "pause":
        const pauseCommand = i.client.commands.get("pause");
        if (pauseCommand instanceof PauseCommand) {
          pauseCommand.pause(i);
        }
        break;
      case "next":
        const nextCommand = i.client.commands.get("skip");
        if (nextCommand instanceof NextCommand) {
          nextCommand.next(i);
        }
        break;
      default:
        break;
    }
  }
}
