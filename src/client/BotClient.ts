import { join } from "path";
import fs from "fs";
import { Client, ClientOptions, Collection } from "discord.js";
import Command, { CommandAbs } from "./Command";
import mongoose from "mongoose";
import { DatabaseOptions } from "../database/DatabaseOptions.type";
import Guild from "../database/schemas/Guilds";

export default class BotClient extends Client {
  public token: string;
  public dbOptions: DatabaseOptions;
  public commands: Collection<string, Command>;
  public constructor(
    token: string,
    dbOptions: DatabaseOptions,
    options: ClientOptions
  ) {
    super(options);
    this.token = token;
    this.dbOptions = dbOptions;
    this.commands = new Collection<string, Command>();
  }
  public start() {
    console.log("Starting Bot");
    this.init();
    this.login(this.token);
  }
  public init() {
    console.log("Initializing Bot");
    this.loadCommands();
    this.loadEventListeners();
    this.connectDatabase();
  }
  private loadCommands() {
    const commandPath = join(__dirname, "..", "commands");
    console.log(`Loading Commands`);
    const commandFiles = fs
      .readdirSync(commandPath)
      .filter((file) => file.endsWith(".ts") || file.endsWith(".js"));
    for (const file of commandFiles) {
      import(`../commands/${file}`).then(
        (dflt: { default: Command | CommandAbs }) => {
          const command = dflt.default;
          this.commands.set(command.data.name, command);
          console.log(`➕ Adding Command: ${command.data.name}`);
        }
      );
    }
    this.on("interactionCreate", async (interaction) => {
      if (!interaction.isCommand()) return;
      const command = this.commands.get(interaction.commandName);
      if (!command) return;
      console.log(
        `Command Triggered: ${interaction.user.tag} triggered Command: ${
          command.data.name
        }, on Server: ${interaction.guild.name} in channel #${
          interaction.guild.channels.cache.get(interaction.channelId).name
        }\n - ${interaction}`
      );
      try {
        command.execute(interaction);
      } catch (error) {
        console.error(
          `Error executing command: ${interaction.commandName} - Error: ${error}`
        );
        await interaction.reply({
          content: "There was an error while executing this command!",
          ephemeral: true,
        });
      }
    });
  }
  private loadEventListeners() {
    console.log("Loading Event Listeners");
    const eventPath = join(__dirname, "..", "events");
    const eventFiles = fs
      .readdirSync(eventPath)
      .filter((file) => file.endsWith(".ts") || file.endsWith(".js"));
    for (const file of eventFiles) {
      import(`../events/${file}`).then((event) => {
        console.log(`➕ Adding Event Listener: ${event.name}`);
        if (event.once) {
          this.once(event.name, (...args) => event.execute(...args));
        } else {
          this.on(event.name, (...args) => event.execute(...args));
        }
      });
    }
  }
  private connectDatabase() {
    mongoose.connect(
      `mongodb://${this.dbOptions.username}:${this.dbOptions.password}@${this.dbOptions.url}:${this.dbOptions.port}/${this.dbOptions.dbName}?${this.dbOptions.dbOptions}`,
      {},
      (err: Error) => {
        if (err) throw err;
        console.log(`Connected to MongoDB`);
      }
    );
  }
}
