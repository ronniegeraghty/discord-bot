import { token, owners, prefix } from "./Config";
import BotClient from "./client/BotClient";

const client: BotClient = new BotClient({ prefix, token, owners });
console.log(`Starting Discord Bot`);
client.start();
