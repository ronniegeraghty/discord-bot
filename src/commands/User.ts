import { SlashCommandBuilder } from "@discordjs/builders";
module.exports = {
  data: new SlashCommandBuilder()
    .setName("user")
    .setDescription("Replies with pong, checks latency of server."),
  async execute(interaction) {
    await interaction.reply(
      `Your tag: ${interaction.user.tag}\nYour id: ${interaction.user.id}`
    );
  },
};
