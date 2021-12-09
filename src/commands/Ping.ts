import { SlashCommandBuilder } from "@discordjs/builders";
module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with pong, checks latency of server."),
  async execute(interaction) {
    await interaction.reply(`Pong! - ${interaction.client.ws.ping}ms`);
  },
};
