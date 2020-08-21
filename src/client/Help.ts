import { Command } from "discord-akairo";

/**
 * Returns the description content for the command
 * @param command {Command} the command to give info on
 * @returns {string} The Command ID followed by the description content
 */
export function help(command: Command): string {
  return `**${command.id}**: ${command.description.content}\n`;
}

/**
 * Returns the description for the command including content, usage, examples, flags
 * @param command {Command} the command to give info on
 * @returns {string} The Command Description content, usage, flags, and examples in a string
 */
export function helpVerbos(command: Command): string {
  let content: string = "";
  content = content + `**${command.id}**: ${command.description.content}\n`;
  content = content + `*Usage*: ${command.description.usage}\n`;
  if (command.description.flags) {
    let flags: string = command.description.flags
      .map((flag) => `\t${flag}\n`)
      .join("");
    content = content + flags;
  }
  let example: string = command.description.examples
    .map((ex) => `\t-${ex}\n`)
    .join("");
  content = content + `Examples:\n` + example;
  return content;
}
