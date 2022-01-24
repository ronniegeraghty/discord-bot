import BotClient from "./client/BotClient";
import { Intents } from "discord.js";
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
    Intents.FLAGS.GUILDS,
    //Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_BANS,
    Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
    Intents.FLAGS.GUILD_INTEGRATIONS,
    Intents.FLAGS.GUILD_WEBHOOKS,
    Intents.FLAGS.GUILD_INVITES,
    Intents.FLAGS.GUILD_VOICE_STATES,
    //Intents.FLAGS.GUILD_PRESENCES,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Intents.FLAGS.GUILD_MESSAGE_TYPING,
    Intents.FLAGS.DIRECT_MESSAGES,
    Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
    Intents.FLAGS.DIRECT_MESSAGE_TYPING,
  ],
});

// Start Bot
client.start();
