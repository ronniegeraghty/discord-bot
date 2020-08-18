import {
  Command as AkairoCommand,
  CommandOptions,
  ArgumentOptions,
  ArgumentGenerator,
} from "discord-akairo";
import { Message } from "discord.js";
import { helpVerbos } from "../commands/PublicCommands/HelpCommand";

export default class Command extends AkairoCommand {
  public constructor(id: string, options: CommandOptions) {
    let helpOptions: ArgumentOptions = {
      id: "help",
      match: "flag",
      flag: "-help",
    };
    let argsObjArr: ArgumentOptions[] = addObj(options.args, helpOptions);
    super(id, { ...options, args: argsObjArr });
  }

  public execute?(message: Message, args: any): any;

  public exec(message: Message, args: any) {
    if (args.help) return message.util.send(helpVerbos(this));
    else {
      return this.execute(message, args);
    }
  }
}

function addObj(
  objArr: ArgumentOptions[] | ArgumentGenerator,
  obj: ArgumentOptions
): ArgumentOptions[] {
  if (!objArr) return [obj];
  let objArrStr: string = JSON.stringify(objArr);
  let objStr: string = JSON.stringify(obj);
  let combineStr: string =
    objArrStr.substring(0, objArrStr.length - 1) + "," + objStr + "]";
  return JSON.parse(combineStr);
}
