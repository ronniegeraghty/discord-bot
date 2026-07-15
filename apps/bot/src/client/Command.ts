import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  Message,
} from "discord.js";

export type CommandOptions = {
  name: string;
  description: string;
  execute?: (interaction: ChatInputCommandInteraction) => void;
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
  public execute: (interaction: ChatInputCommandInteraction) => void;
  public constructor(options: CommandOptions) {
    super(options);
    this.execute = options.execute;
  }
}
export abstract class CommandAbs {
  abstract data: SlashCommandBuilder;
  abstract execute(interaction: ChatInputCommandInteraction): void;
}

export type CommandType = {
  data: any;
  execute: (Interaction: ChatInputCommandInteraction) => void;
};

export abstract class RawCommand {
  public name: string;
  public constructor(name: string) {
    this.name = name;
  }
  abstract execute(message: Message): void;
}

export type RawCommandOptions = {
  prefix: string;
};

export type COMMANDS = Command | CommandAbs | CommandType;
