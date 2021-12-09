import fs from "fs";
import { join } from "path";
import { Collection, Intents } from "discord.js";
import { token } from "./config.json";
import BotClient from "./client/BotClient";

// Create instance of client
const client = new BotClient(token, { intents: [Intents.FLAGS.GUILDS] });

// Login to Discord with your client's token
client.start();
