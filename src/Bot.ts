import fs from "fs";
import { join } from "path";
import {
  Client as DiscordClient,
  ClientOptions,
  Collection,
  Intents,
} from "discord.js";
import { token } from "./config.json";

class Command {
  public data;
  public execute;
}
class Client extends DiscordClient {
  public commands: Collection<string, Command>;
  public constructor(options: ClientOptions) {
    super({ intents: [Intents.FLAGS.GUILDS] });
  }
}

// Create instance of client
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

//Import Commands
client.commands = new Collection();
const commandPath = join(__dirname, "commands");
const commandFies = fs
  .readdirSync(commandPath)
  .filter((file) => file.endsWith(".ts"));

for (const file of commandFies) {
  import(`./commands/${file}`).then((command) => {
    client.commands.set(command.data.name, command);
  });
}

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;
  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "There was an error while executing this command!",
      ephemeral: true,
    });
  }
});

//Import Event listeners
const eventPath = join(__dirname, "events");
const eventFiles = fs
  .readdirSync(eventPath)
  .filter((file) => file.endsWith(".ts"));

for (const file of eventFiles) {
  import(`./events/${file}`).then((event) => {
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args));
    } else {
      client.on(event.name, (...args) => event.execute(...args));
    }
  });
}

//When the client is ready, run this code(only once)
client.once("ready", () => {
  console.log(`${client.user.tag} is Ready!`);
});

// Login to Discord with your client's token
client.login(token);
