import Command from "../client/Command";

export default new Command({
  name: "ping",
  description: "Replies with pong, checks latency of server.",
  execute: async (interaction) => {
    if (interaction.isCommand()) {
      await interaction.reply(`Pong! - ${interaction.client.ws.ping}ms`);
    }
  },
});
