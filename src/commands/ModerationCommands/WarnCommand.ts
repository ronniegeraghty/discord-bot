import { Command } from "discord-akairo";
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
          prompt: {
            start: (msg: Message) =>
              `${msg.author}, please provide a member to warn ...`,
            retry: (msg: Message) =>
              `${msg.author}, please provide a valid member to warn...`,
          },
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

  public async exec(
    message: Message,
    { member, reason }: { member: GuildMember; reason: string }
  ): Promise<Message> {
    const warnRepo: Repository<Warns> = this.client.db.getRepository(Warns);
    if (
      member.roles.highest.position >= message.member.roles.highest.position &&
      message.author.id !== message.guild.ownerID
    ) {
      return message.util.reply(
        "this member has higher or equal roles to you!"
      );
    }

    await warnRepo.insert({
      guild: message.guild.id,
      user: member.id,
      moderator: message.author.id,
      reason: reason,
    });

    return message.util.send(
      `**${member.user.tag}** has been warned by **${message.author.tag}** for *${reason}*`
    );
  }
}
