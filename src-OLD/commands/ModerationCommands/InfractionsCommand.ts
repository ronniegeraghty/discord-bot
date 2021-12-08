import Command from "../../client/Command";
import { Message, GuildMember, User, MessageEmbed } from "discord.js";
import { Repository } from "typeorm";
import { Warns } from "../../models/Warns";

export default class InfractionsCommand extends Command {
  public constructor() {
    super("infractions", {
      aliases: ["infractions", "warns"],
      category: "Moderation Commands",
      description: {
        content: "Check infractions of a member",
        usage: "infractions [ member ]",
        examples: ["infractions @Host#0001", "infractions host"],
      },
      ratelimit: 3,
      userPermissions: ["MANAGE_MESSAGES"],
      args: [
        {
          id: "member",
          type: "member",
          default: (msg: Message) => msg.member,
        },
      ],
    });
  }

  public async execute(
    message: Message,
    { member }: { member: GuildMember }
  ): Promise<Message> {
    //Check if member was given, if not send reply
    if (!member)
      return message.util.reply(
        `Please spefify which member you would like to see the infractions for. `
      );
    //Get WarnsRepo
    const warnRepo: Repository<Warns> = this.client.db.getRepository(Warns);
    //Get all Warns for mentioned member
    const warns: Warns[] = await warnRepo.find({
      user: member.id,
      guild: message.guild.id,
    });
    //If no infractions found reply with message
    if (!warns.length) return message.util.reply("No infractions found.");
    //Format infractions
    const infractions = await Promise.all(
      warns.map(async (v: Warns, i: number) => {
        const mod: User = await this.client.users
          .fetch(v.moderator)
          .catch(() => null);
        if (mod)
          return {
            index: i + 1,
            moderator: mod.tag,
            reason: v.reason,
          };
      })
    );
    //Reply with infractions
    return message.util.send(
      new MessageEmbed()
        .setAuthor(
          `Infractions | ${member.user.username}`,
          member.user.defaultAvatarURL
        )
        .setColor("#f44336")
        .setDescription(
          infractions.map(
            (v) =>
              `\`#${v.index}\` | Moderator: *${v.moderator}*\nReason: *${v.reason}*\n`
          )
        )
    );
  }
}
