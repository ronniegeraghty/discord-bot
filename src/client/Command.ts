import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from 'discord.js';

type CommandOptions = {
    name: string;
    description: string,
    execute?: (interaction: CommandInteraction) => void;
};
export class Command {
    public data: SlashCommandBuilder;
    public constructor(options: CommandOptions) {
        this.data = new SlashCommandBuilder().setName(options.name).setDescription(options.description);
    }
}