import Command from "../../client/Command";
import { Message, GuildMember, MessageEmbed, ImageSize } from "discord.js";

export default class AvatarCommand extends Command {
  public constructor() {
    super("avatar", {
      aliases: ["avatar", "av"],
      category: "Public Commands",
      description: {
        content: "Display the avatar of a member",
        usage: "avatar [ member ]",
        examples: ["avatar", "avatar @Host#0001", "avatar host"],
      },
      ratelimit: 3,
      args: [
        {
          id: "member",
          type: "member",
          match: "rest",
          default: (msg: Message) => msg.member,
        },
        {
          id: "size",
          type: (_: Message, str: string): null | Number => {
            if (
              str &&
              !isNaN(Number(str)) &&
              [16, 32, 64, 128, 256, 512, 1024, 2048].includes(Number(str))
            )
              return Number(str);
            return null;
          },
          match: "option",
          flag: ["-size="],
          default: 2048,
        },
      ],
    });
  }
  public execute(
    message: Message,
    { member, size }: { member: GuildMember; size: number }
  ): Promise<Message> {
    return message.util.send(
      new MessageEmbed()
        .setTitle(`Avatar | ${member.user.tag}`)
        .setColor("RANDOM")
        .setImage(member.user.displayAvatarURL({ size: size as ImageSize }))
    );
  }
}
