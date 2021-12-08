import { Client, Intents } from "discord.js";
import { token } from "./config.json";

// Create instance of client
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

//When the client is ready, run this code(only once)
client.once("ready", () => {
  console.log(`${client.user.tag} is Ready!`);
});

// Login to Discord with your client's token
client.login(token);
