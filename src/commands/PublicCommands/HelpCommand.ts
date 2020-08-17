import { Command } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";

export default class HelpCommand extends Command {
  public constructor() {
    super("help", {
      aliases: ["help"],
      category: "Public Commands",
      description: {
        content: `Get help on how to use the bot`,
        useage: "help",
        examples: ["help"],
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

  public async exec(
    message: Message,
    { color, verbos }: { color: string; verbos: boolean }
  ): Promise<Message> {
    let commands: Set<Command> = new Set();
    this.client.commandHanlder.aliases.array().forEach((alias) => {
      commands.add(this.client.commandHanlder.findCommand(alias));
    });
    let description: string[] = [];
    commands.forEach((command: Command) => {
      if (verbos) {
        description.push(helpVerbos(command));
      } else {
        description.push(help(command));
      }
    });
    return message.util.send(
      new MessageEmbed()
        .setAuthor(`Help`)
        .setColor(`#${color}`)
        .setDescription(description)
    );
  }
}

function help(command: Command): string {
  return `**${command.id}**: ${command.description.content}\n`;
}
module.exports.help = help;

function helpVerbos(command: Command): string {
  let example: string = command.description.examples
    .map((ex) => `-${ex}\n`)
    .join("");
  return `**${command.id}**: ${command.description.content}\n\t*Usage*: ${command.description.usage}\n\t*Examples*:\n ${example}`;
}
module.exports.helpVerbos = helpVerbos;
