export type Hand = "rock" | "paper" | "scissor";

export const HANDS: Record<Hand, { emoji: string; beats: Hand }> = {
  rock: { emoji: "✊", beats: "scissor" },
  paper: { emoji: "✋", beats: "rock" },
  scissor: { emoji: "✌", beats: "paper" },
};

export type RpsPlayer = { userid: string; handId: string };

/**
 * Determine the winner of a two-player Rock-Paper-Scissors round.
 * Returns the winning player's userid, "DRAW" on a tie, or undefined when the
 * game is not a valid two-player round.
 */
export function calcWinner(game: RpsPlayer[]): string | undefined {
  if (game.length !== 2) return undefined;
  if (game[0].handId === game[1].handId) return "DRAW";
  if (HANDS[game[0].handId].beats === game[1].handId) return game[0].userid;
  return game[1].userid;
}
