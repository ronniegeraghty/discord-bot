import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../client/Command";


class EchoCommand extends Command {
  public data = new SlashCommandBuilder()
    .setName('echo')
    .setDescription('Replies with the same message that was sent.');i
  public constructor() {
    super();
    this.addOptions();
  }
  public addOptions(){
    this.data.addStringOption((option) => option.setName('input').setDescription('Text to post').setRequired(true));
  }
  public execute = async (interaction: CommandInteraction) => {
    await interaction.reply(`${interaction.options.get('input').value.toString()}`);
  };
}
export default new EchoCommand(); 
