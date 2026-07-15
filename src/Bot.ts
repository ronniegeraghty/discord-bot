import BotClient from "./client/BotClient";
import { GatewayIntentBits } from "discord.js";
import * as dotenv from "dotenv";
import { DatabaseOptions } from "./database/DatabaseOptions.type";
import { RawCommandOptions } from "./client/Command";
dotenv.config();

const token = process.env.DISCORD_TOKEN;
const dbConfig: DatabaseOptions = {
  username: process.env.MONGO_ROOT_USER,
  password: process.env.MONGO_ROOT_PASSWORD,
  url:
    process.env.ENV === "CONTAINER" ? process.env.MONGO_HOST_NAME : "localhost",
  port: process.env.MONGO_INTERNAL_PORT,
  dbName: process.env.MONGO_DATABASE,
  dbOptions: process.env.MONGO_OPTIONS,
};

const rawCommandOptions: RawCommandOptions = {
  prefix: process.env.PREFIX,
};

// Create instance of client
const client = new BotClient(token, dbConfig, rawCommandOptions, {
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
