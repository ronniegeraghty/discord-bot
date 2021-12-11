import { token, databaseConfig } from "./config.json";
import BotClient from "./client/BotClient";
import { Intents } from "discord.js";

// Create instance of client
const client = new BotClient(token, databaseConfig, {
  intents: [Intents.FLAGS.GUILDS],
});

// Login to Discord with your client's token
client.start();
