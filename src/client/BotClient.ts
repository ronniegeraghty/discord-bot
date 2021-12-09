import { join } from "path";
import fs from "fs";
import { Client, ClientOptions, Collection, Intents } from "discord.js";
import Command from "./Command";

export default class BotClient extends Client {
  public token: string;
  public commands: Collection<string, Command>;
  public constructor(token: string, options: ClientOptions) {
    super({ intents: [Intents.FLAGS.GUILDS] });
    this.token = token;
    this.commands = new Collection<string, Command>();
  }
  public start() {
    this.init();
    this.login(this.token);
  }
  public init() {
    this.loadCommands();
    this.loadEventListeners();
  }
  public loadCommands() {
    const commandPath = join(__dirname, "..", "commands");
    const commandFiles = fs
      .readdirSync(commandPath)
      .filter((file) => file.endsWith(".ts"));
    for (const file of commandFiles) {
      import(`../commands/${file}`).then((command) => {
        this.commands.set(command.data.name, command);
      });
    }
    this.on("interactionCreate", async (interaction) => {
      if (!interaction.isCommand()) return;
      const command = this.commands.get(interaction.commandName);
      if (!command) return;
      try {
        await command.execute(interaction);
      } catch (error) {
        await interaction.reply({
          content: "There was an error while executing this command!",
          ephemeral: true,
        });
      }
    });
  }
  public loadEventListeners() {
    const eventPath = join(__dirname, "..", "events");
    const eventFiles = fs
      .readdirSync(eventPath)
      .filter((file) => file.endsWith(".ts"));
    for (const file of eventFiles) {
      import(`../events/${file}`).then((event) => {
        if (event.once) {
          this.once(event.name, (...args) => event.execute(...args));
        } else {
          this.on(event.name, (...args) => event.execute(...args));
        }
      });
    }
  }
}
