import { CacheType, CommandInteraction, Integration } from "discord.js";
import PingCommand from "./PingCommand";

describe("Ping Command Tests", () => {
  const interaction = {
    reply: jest.fn(),
    client: {
      ws: {
        ping: 100,
      },
    },
  } as unknown as CommandInteraction<CacheType>;
  it("return command's response ping", async () => {
    PingCommand.execute(interaction);
    expect(interaction.reply).toHaveBeenCalledWith(
      `Pong! - ${interaction.client.ws.ping}ms`
    );
  });
});
