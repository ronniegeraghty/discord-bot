import { SlashCommandBuilder } from "@discordjs/builders";
import {
  Interaction,
  CacheType,
  MessageActionRow,
  MessageButton,
  InteractionCollector,
  ButtonInteraction,
} from "discord.js";
import { CommandAbs } from "../client/Command";

class RPSCommand extends CommandAbs {
  public data = new SlashCommandBuilder()
    .setName("rps")
    .setDescription("Play Rock Paper Scissors.");
  private HANDS = {
    rock: {
      emoji: "✊",
      beats: "scissor",
    },
    paper: {
      emoji: "✋",
      beats: "rock",
    },
    scissor: {
      emoji: "✌",
      beats: "paper",
    },
  };
  public async execute(interaction: Interaction<CacheType>): Promise<void> {
    if (interaction.isCommand()) {
      const buttons = new MessageActionRow().addComponents(
        Object.keys(this.HANDS).map((key) =>
          new MessageButton()
            .setCustomId(key)
            .setLabel(this.HANDS[key].emoji)
            .setStyle("PRIMARY")
        )
      );
      await interaction.reply({
        content: "Choose your hand:",
        components: [buttons],
      });
      const filter = (i: ButtonInteraction) =>
        i.customId in this.HANDS && i.user.id === interaction.user.id;

      const collector: InteractionCollector<Interaction> =
        interaction.channel.createMessageComponentCollector({
          filter,
          time: 15000,
        });
      collector.on("collect", async (i) => {
        if (i.isButton()) {
          const arrOfHANDS = Object.keys(this.HANDS);
          const randomHand =
            arrOfHANDS[Math.floor(Math.random() * arrOfHANDS.length)];
          const winner = this.calcWinner([
            { userid: i.user.id, handId: i.customId },
            { userid: i.client.user.id, handId: randomHand },
          ]);
          let result = "empty";
          if (winner) {
            if (winner === "DRAW") {
              result = winner;
            } else {
              result = `${i.client.users.cache.get(winner)} Wins!`;
            }
            console.log(
              ` - User chose: ${
                i.customId
              } - Bot chose: ${randomHand} - Winner: ${
                i.client.users.cache.get(winner).tag
              }`
            );
          }
          i.update({
            content: `${i.user.tag}: ${this.HANDS[i.customId].emoji} VS ${
              i.client.user.tag
            }: ${this.HANDS[randomHand].emoji}\n${result}`,
            components: [],
          });
          collector.stop("Finished");
        }
      });
    }
  }
  private calcWinner(
    game: { userid: string; handId: string }[]
  ): string | void {
    if (game.length !== 2) return;
    else if (game[0].handId === game[1].handId) return "DRAW";
    else if (this.HANDS[game[0].handId].beats === game[1].handId)
      return game[0].userid;
    else return game[1].userid;
  }
}
export default new RPSCommand();
