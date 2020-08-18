import {
  Command as AkairoCommand,
  CommandOptions,
  ArgumentOptions,
  Argument,
} from "discord-akairo";
import { Message } from "discord.js";
import { help, helpVerbos } from "./PublicCommands/HelpCommand";

export default class Command extends AkairoCommand {
  public constructor(id: string, options: CommandOptions) {
    let helpOptions: ArgumentOptions = {
      id: "help",
      match: "flag",
      flag: "-help",
    };
    let argsString: string =
      options.args.toString() + "," + JSON.stringify(helpOptions);
    let argsObjArr = JSON.parse(argsString);

    super(id, { ...options, args: [helpOptions] });
  }

  public exec(message: Message, args: any) {
    if (help) return;
  }
}
