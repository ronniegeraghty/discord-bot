import { describe, it, expect } from "vitest";
import { calcWinner } from "./rps";

const p1 = "user-1";
const p2 = "user-2";

describe("calcWinner", () => {
  it("returns undefined when there are not exactly two players", () => {
    expect(calcWinner([])).toBeUndefined();
    expect(calcWinner([{ userid: p1, handId: "rock" }])).toBeUndefined();
    expect(
      calcWinner([
        { userid: p1, handId: "rock" },
        { userid: p2, handId: "paper" },
        { userid: "user-3", handId: "scissor" },
      ])
    ).toBeUndefined();
  });

  it("returns DRAW when both players pick the same hand", () => {
    expect(
      calcWinner([
        { userid: p1, handId: "rock" },
        { userid: p2, handId: "rock" },
      ])
    ).toBe("DRAW");
  });

  it("rock beats scissor", () => {
    expect(
      calcWinner([
        { userid: p1, handId: "rock" },
        { userid: p2, handId: "scissor" },
      ])
    ).toBe(p1);
  });

  it("paper beats rock", () => {
    expect(
      calcWinner([
        { userid: p1, handId: "paper" },
        { userid: p2, handId: "rock" },
      ])
    ).toBe(p1);
  });

  it("scissor beats paper", () => {
    expect(
      calcWinner([
        { userid: p1, handId: "scissor" },
        { userid: p2, handId: "paper" },
      ])
    ).toBe(p1);
  });

  it("resolves the winner regardless of player order", () => {
    expect(
      calcWinner([
        { userid: p1, handId: "rock" },
        { userid: p2, handId: "paper" },
      ])
    ).toBe(p2);
  });
});
