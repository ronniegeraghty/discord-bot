import BotClient from "./client/BotClient";
import { GatewayIntentBits } from "discord.js";
import { config } from "./config";
import { logger } from "./logger";

// Global safety nets: a single command or stream error should never crash the
// entire bot process. Log and keep running instead.
process.on("unhandledRejection", (reason) => {
  logger.error({ err: reason }, "Unhandled promise rejection");
});
process.on("uncaughtException", (error) => {
  logger.error({ err: error }, "Uncaught exception");
});

// Create instance of client
const client = new BotClient(config.discordToken, config.databaseOptions, config.rawCommandOptions, {
  intents: [
    GatewayIntentBits.Guilds,
    //GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildVoiceStates,
    //GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.DirectMessageTyping,
    GatewayIntentBits.MessageContent,
  ],
});

// Start Bot
client.start();
