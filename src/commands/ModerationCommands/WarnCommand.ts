import Command from "../../client/Command";
import { Message, GuildMember } from "discord.js";
import { Repository } from "typeorm";
import { Warns } from "../../models/Warns";

export default class WarnCommand extends Command {
  public constructor() {
    super("warn", {
      aliases: ["warn"],
      category: "Moderation Command",
      description: {
        content: "Warn a member in the server",
        usage: "warn [ member ] < reason >",
        examples: ["warn @Host#0001 swearing", "warn host swearing"],
      },
      ratelimit: 3,
      userPermissions: ["MANAGE_MESSAGES"],
      args: [
        {
          id: "member",
          type: "member",
        },
        {
          id: "reason",
          type: "string",
          match: "rest",
          default: "No reason provided",
        },
      ],
    });
  }

  public async execute(
    message: Message,
    { member, reason }: { member: GuildMember; reason: string }
  ): Promise<Message> {
    //Check if member mentioned, if not reply with message
    if (!member)
      return message.util.reply(`You must include the member to warn!`);
    //Get Warns Repo
    const warnRepo: Repository<Warns> = this.client.db.getRepository(Warns);
    //Check if Member has higher permissions than sender, if so reply with message
    if (
      member.roles.highest.position >= message.member.roles.highest.position &&
      message.author.id !== message.guild.ownerID
    ) {
      return message.util.reply(
        "this member has higher or equal roles to you!"
      );
    }
    //Add Warn to Warn Repo
    await warnRepo.insert({
      guild: message.guild.id,
      user: member.id,
      moderator: message.author.id,
      reason: reason,
    });
    //Reply with message saying user has been warned
    return message.util.send(
      `**${member.user.tag}** has been warned by **${message.author.tag}** for *${reason}*`
    );
  }
}
