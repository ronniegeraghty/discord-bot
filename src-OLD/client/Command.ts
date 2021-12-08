import {
  Command as AkairoCommand,
  CommandOptions,
  ArgumentOptions,
  ArgumentGenerator,
} from "discord-akairo";
import { Message } from "discord.js";
import { helpVerbos } from "./Help";

export default class Command extends AkairoCommand {
  public constructor(id: string, options: CommandOptions) {
    // Default -help flag to add to every command
    let helpOptions: ArgumentOptions = {
      id: "help",
      match: "flag",
      flag: "-help",
    };
    let argsObjArr: ArgumentOptions[] = addObj(options.args, helpOptions);
    super(id, { ...options, args: argsObjArr });
  }
  //New method to use to say what happens when a Command is called.
  public execute?(message: Message, args: any): any;
  //Set up to see if help flag was used, if so don't execute the command just send message with command description
  public exec(message: Message, args: any) {
    if (args.help) return message.util.send(helpVerbos(this));
    else {
      return this.execute(message, args);
    }
  }
}

/**
 * Given an Array of Argument Options and a new Argument Option returns array with all Argument Options.
 * @param objArr {ArgumentOptions[] | ArgumentGenerator} array of arrguments options to add and argument too
 * @param obj  {ArgumentOptions} Argument options to be added to previous array
 * @returns {ArgumentOptions[]}
 */
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
