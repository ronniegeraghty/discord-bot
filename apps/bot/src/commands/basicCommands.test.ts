import { describe, it, expect, vi } from "vitest";
import ping from "./PingCommand";
import echo from "./EchoCommand";

describe("PingCommand", () => {
  it("replies with pong and the websocket ping", async () => {
    const reply = vi.fn();
    const interaction = {
      reply,
      client: { ws: { ping: 42 } },
    } as never;

    await ping.execute(interaction);

    expect(reply).toHaveBeenCalledWith("Pong! - 42ms");
  });
});

describe("EchoCommand", () => {
  it("echoes the provided input", async () => {
    const reply = vi.fn();
    const getString = vi.fn().mockReturnValue("hello world");
    const interaction = {
      isCommand: () => true,
      reply,
      options: { getString },
    } as never;

    await echo.execute(interaction);

    expect(getString).toHaveBeenCalledWith("input");
    expect(reply).toHaveBeenCalledWith("Your input: hello world ");
  });

  it("does nothing when the interaction is not a command", async () => {
    const reply = vi.fn();
    const interaction = {
      isCommand: () => false,
      reply,
      options: { getString: vi.fn() },
    } as never;

    await echo.execute(interaction);

    expect(reply).not.toHaveBeenCalled();
  });
});
