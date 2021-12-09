import { Interaction } from "discord.js";
import Command from "../client/Command";

class ServerCommand extends Command {
  public constructor() {
    super({
      name: "server",
      description: "Replies with server info.",
      execute: async (interaction: Interaction) => {
        if (interaction.isCommand()) {
          await interaction.reply(
            `Server name: ${interaction.guild.name}\nTotal members: ${interaction.guild.memberCount}`
          );
        }
      },
    });
  }
}
export default new ServerCommand();
