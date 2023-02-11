import { CommandInteraction, GuildMember, SlashCommandBuilder } from "discord.js";
import BotClient from "../client/BotClient";
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
		// get url option
		let url: string = interaction.options.get('url').value.toString();
		// extract properties from interaction
		const { member, client, guildId } = interaction;
		// type check on member and client
		if (member instanceof GuildMember && client instanceof BotClient) {
			//TODO
		}
	};
}
export default new PlayCommand();