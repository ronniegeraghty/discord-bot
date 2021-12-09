import { SlashCommandBuilder } from "@discordjs/builders";
import { Interaction } from "discord.js";
// export default class Command {
//   public data;
//   public execute;
// }

export default interface Command {
  data: SlashCommandBuilder;
  execute: (interaction: Interaction) => void;
}

export type CommandOptions = {
  name: string;
  description: string;
};

// export default abstract class Command {
//   public data: SlashCommandBuilder;
//   public constructor(options: CommandOptions) {
//     this.data = new SlashCommandBuilder()
//       .setName(options.name)
//       .setDescription(options.description);
//   }
//   abstract execute(interaction: Interaction): void;
// }
