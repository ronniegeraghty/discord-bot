import Command from "../../client/Command";
import { Message, MessageEmbed } from "discord.js";
import { help, helpVerbos } from "../../client/Help";

export default class HelpCommand extends Command {
  public constructor() {
    super("help", {
      aliases: ["help"],
      category: "Public Commands",
      description: {
        content: `Get help on how to use the bot.`,
        usage: "help",
        flags: [
          `**-v** verbos option`,
          `**-color** change color for embed, takes 6 digit hex color code`,
        ],
        examples: ["help", "help -v"],
      },
      ratelimit: 3,
      args: [
        {
          id: "color",
          match: "option",
          flag: "-color",
        },
        {
          id: "verbos",
          match: "flag",
          flag: "-v",
        },
      ],
    });
  }

  public async execute(
    message: Message,
    { color, verbos }: { color: string; verbos: boolean }
  ): Promise<Message> {
    //Make a Set to hold all commands with no repeats
    let commands: Set<Command> = new Set();
    //For all aliases, add that command to Set of commands
    this.client.commandHanlder.aliases.array().forEach((alias) => {
      commands.add(this.client.commandHanlder.findCommand(alias));
    });
    //Make an array for all the command descriptions
    let description: string[] = [];
    //For all commands, add command descriptino string to description array
    commands.forEach((command: Command) => {
      //Check for verbos flag, if included add verbos description string to array
      if (verbos) {
        description.push(helpVerbos(command));
      } else {
        description.push(help(command));
      }
    });
    //return message embed with all descrtions.
    return message.util.send(
      new MessageEmbed()
        .setAuthor(`Help`)
        .setColor(`#${color}`)
        .setDescription(description)
    );
  }
}
