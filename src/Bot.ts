import { token, databaseConfig, rawCommandOptions } from "./config.json";
import BotClient from "./client/BotClient";
import { Intents } from "discord.js";
import * as dotenv from "dotenv";
dotenv.config();

let dbConfig = databaseConfig;

//Check if Prod Env and if Prod change config options
if (process.env.ENV === "PROD") {
  console.log(`Configuring for PROD`);
  dbConfig = {
    ...databaseConfig,
    url: process.env.MONGO_HOST_NAME,
    dbOptions: "authSource=admin",
  };
}
console.log("DB CONFIG: ", dbConfig);

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
