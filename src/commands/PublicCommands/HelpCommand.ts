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
      ],
    });
  }

  public async exec(
    message: Message,
    { color }: { color: string }
  ): Promise<Message> {
    console.log(color);
    let commands: Set<Command> = new Set();
    this.client.commandHanlder.aliases.array().forEach((alias) => {
      if (alias !== null)
        commands.add(this.client.commandHanlder.findCommand(alias));
    });
    let description: string[] = [];
    commands.forEach((command: Command) => {
      console.log(`${command.id}: ${command.description.content}`);
      let example: string = command.description.examples
        .map((ex) => `-${ex}\n`)
        .join("");
      console.log(`EXAMPLES: ${example}`);

      description.push(
        `**${command.id}**: ${command.description.content}\n\t*Usage*: ${command.description.usage}\n\t*Examples*:\n ${example}\n`
      );
    });
    return message.util.send(
      new MessageEmbed()
        .setAuthor(`Help`)
        .setColor(`#${color}`)
        .setDescription(description)
    );
  }
}
