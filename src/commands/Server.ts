import { SlashCommandBuilder } from "@discordjs/builders";
module.exports = {
  data: new SlashCommandBuilder()
    .setName("server")
    .setDescription("Replies with pong, checks latency of server."),
  async execute(interaction) {
    await interaction.reply(
      `Server name: ${interaction.guild.name}\nTotal members: ${interaction.guild.memberCount}`
    );
  },
};
