import { SlashCommandBuilder } from "@discordjs/builders";
import { Interaction } from "discord.js";

export type CommandOptions = {
  name: string;
  description: string;
  execute?: (interaction: Interaction) => void;
};

class BaseCommand {
  public data: SlashCommandBuilder;
  public constructor(options: CommandOptions) {
    this.data = new SlashCommandBuilder()
      .setName(options.name)
      .setDescription(options.description);
  }
}

export default class Command extends BaseCommand {
  public execute: (interaction: Interaction) => void;
  public constructor(options: CommandOptions) {
    super(options);
    this.execute = options.execute;
  }
}
export abstract class CommandAbs extends BaseCommand {
  public constructor(options: CommandOptions) {
    super(options);
  }
  abstract execute(interaction: Interaction): void;
}

export type CommandType = {
  data: SlashCommandBuilder;
  execute: (Interaction: Interaction) => void;
};
