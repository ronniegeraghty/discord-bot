import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  MessageComponentInteraction,
  SlashCommandBuilder,
} from "discord.js";
import { CommandAbs } from "../client/Command";
import { logger } from "../logger";
import { HANDS, calcWinner } from "../game/rps";

class RPSCommand extends CommandAbs {
  public data = new SlashCommandBuilder()
    .setName("rps")
    .setDescription("Play Rock Paper Scissors.");
  public async execute(
    interaction: ChatInputCommandInteraction
  ): Promise<void> {
    const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents(
      Object.keys(HANDS).map((key) =>
        new ButtonBuilder()
          .setCustomId(key)
          .setLabel(HANDS[key].emoji)
          .setStyle(ButtonStyle.Primary)
      )
    );
    await interaction.reply({
      content: "Choose your hand:",
      components: [buttons],
    });
    const filter = (i: MessageComponentInteraction) =>
      i.customId in HANDS && i.user.id === interaction.user.id;

    const collector = interaction.channel.createMessageComponentCollector({
      filter,
      time: 15000,
    });
    collector.on("collect", async (i) => {
      if (i.isButton()) {
        const arrOfHANDS = Object.keys(HANDS);
        const randomHand =
          arrOfHANDS[Math.floor(Math.random() * arrOfHANDS.length)];
        const winner = calcWinner([
          { userid: i.user.id, handId: i.customId },
          { userid: i.client.user.id, handId: randomHand },
        ]);
        let result = "empty";
        if (winner) {
          if (winner === "DRAW") {
            result = "It's a draw!";
          } else {
            const winnerUser = winner === i.user.id ? i.user : i.client.user;
            result = `${winnerUser.tag} Wins!`;
          }
          logger.info(
            `RPS: user chose ${i.customId}, bot chose ${randomHand} - ${result}`
          );
        }
        i.update({
          content: `${i.user.tag}: ${HANDS[i.customId].emoji} VS ${
            i.client.user.tag
          }: ${HANDS[randomHand].emoji}\n${result}`,
          components: [],
        });
        collector.stop("Finished");
      }
    });
  }
}
export default new RPSCommand();
