import { Interaction } from "discord.js";
import { CommandAbs } from "../client/Command";

class UserCommand extends CommandAbs {
  public constructor() {
    super({
      name: "user",
      description: "Replies with user info.",
    });
  }
  public async execute(interaction: Interaction): Promise<void> {
    if (interaction.isCommand()) {
      await interaction.reply(
        `Your tag: ${interaction.user.tag}\nYour id: ${interaction.user.id}`
      );
    }
  }
}
export default new UserCommand();
