import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../client/Command";
class PlayCommand extends Command {
    public data = new SlashCommandBuilder()
        .setName('play')
        .setDescription('Play music in a voice channel');
    public constructor() {
        super();
        this.addOptions();
    }
    public addOptions() {
        this.data.addStringOption((option) => option.setName('url').setDescription('A valid youtube url.').setRequired(true));
    }
    public execute = async (interaction: CommandInteraction) => {
        let url: string = interaction.options.get('url').value.toString();
        await interaction.reply(`url: ${url}`);
    };
}
export default new PlayCommand();