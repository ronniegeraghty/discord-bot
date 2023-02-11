import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from 'discord.js';

type CommandOptions = {
    name: string;
    description: string,
    execute?: (interaction: CommandInteraction) => void;
};
export abstract class Command {
    abstract data: SlashCommandBuilder;
    abstract execute(interaction: CommandInteraction): void;
}