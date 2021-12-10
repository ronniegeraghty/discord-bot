import { SlashCommandBuilder } from "@discordjs/builders";
import { Interaction } from "discord.js";
import { CommandAbs, CommandType } from "../client/Command";

// class EchoCommand extends CommandAbs {
//   public constructor() {
//     super({
//       name: "echo",
//       description: "Replies with your input",
//     });
//   }
// //   public data = new SlashCommandBuilder()
// //     .setName("echo")
// //     .setDescription("Replies with your input")
// //     .addStringOption((option) =>
// //       option
// //         .setName("input")
// //         .setDescription("The input to echo back")
// //         .setRequired(true)
// //     );
//   public async execute(interaction: Interaction): Promise<void> {
//     if (interaction.isCommand()) {
//       await interaction.reply(`Your input: `);
//     }
//   }
// }
//export default new EchoCommand();

const EchoCommand: CommandType = {
  data: new SlashCommandBuilder()
    .setName("echo")
    .setDescription("Replies with your input")
    .addStringOption((option) =>
      option
        .setName("input")
        .setDescription("The input to echo back")
        .setRequired(true)
    ),
  async execute(interaction) {
    if (interaction.isCommand()) {
      await interaction.reply(
        `Your input: ${interaction.options.getString("input")} `
      );
    }
  },
};
export default EchoCommand;
