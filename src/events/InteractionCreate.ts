import { Interaction } from "discord.js";

module.exports = {
  name: "interactionCreate",
  execute(interaction: Interaction) {
    console.log(
      `${interaction.user.tag} in #${interaction.guild.channels.cache.get(
        interaction.channelId
      )} triggered an interaction.`
    );
  },
};
