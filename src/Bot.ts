import { Client, Intents, Interaction, Message } from "discord.js";
import { token } from "./config.json";

// Create instance of client
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

//When the client is ready, run this code(only once)
client.once("ready", () => {
  console.log(`${client.user.tag} is Ready!`);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;
  if (commandName === "ping") {
    await interaction.reply(`Pong! - ${client.ws.ping}ms`);
  } else if (commandName === "server") {
    await interaction.reply(
      `Server name: ${interaction.guild.name}\nTotal members: ${interaction.guild.memberCount}`
    );
  } else if (commandName === "user") {
    await interaction.reply(
      `Your tag: ${interaction.user.tag}\nYour id: ${interaction.user.id}`
    );
  }
});

// Login to Discord with your client's token
client.login(token);
