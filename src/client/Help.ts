import { Command } from "discord-akairo";

export function help(command: Command): string {
  return `**${command.id}**: ${command.description.content}\n`;
}

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
