import { Listener } from "discord-akairo";
import {
  GuildMember,
  GuildChannel,
  TextChannel,
  Message,
  MessageEmbed,
} from "discord.js";
import { Snowflake } from "discord.js";
import { Collection } from "discord.js";

export default class MemberJoinListener extends Listener {
  public constructor() {
    super("guildMemberAdd", {
      emitter: "client",
      event: "guildMemberAdd",
      category: "client",
    });
  }

  public exec(member: GuildMember): Promise<Message> {
    //Get all channel on the discord server
    let channelCollection: Collection<Snowflake, GuildChannel> =
      member.guild.channels.cache;
    //Get the General Channel
    let generalChannel: GuildChannel = channelCollection.find(
      (channel) => channel.name === "general"
    );
    //Make we got a channel with name general and it's a text channel, then send welcome message
    if (generalChannel && generalChannel instanceof TextChannel)
      return generalChannel.send(
        new MessageEmbed().setDescription(
          `**${member.displayName}**, I am so sorry you have ended up here. This is a place of dispair. Until you embrace your inner Groblin you will continue to hurt.\nWelcome!`
        )
      );
  }
}
