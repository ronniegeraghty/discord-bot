import { join } from "path";
import fs from "fs";
import {
  Client,
  ClientOptions,
  Collection,
  Interaction,
  InteractionCollector,
  Message,
} from "discord.js";
import { COMMANDS, RawCommand, RawCommandOptions } from "./Command";
import mongoose from "mongoose";
import { DatabaseOptions } from "../database/DatabaseOptions.type";
import MusicSubscription from "./Subscription";

export default class BotClient extends Client {
  public token: string;
  public dbOptions: DatabaseOptions;
  public commands: Collection<string, COMMANDS>;
  public rawCommands: Collection<string, RawCommand>;
  public rawCommandOptions: RawCommandOptions;
  public subscriptions: Collection<string, MusicSubscription>;
  public collectors: Collection<string, InteractionCollector<Interaction>>;
  public constructor(
    token: string,
    dbOptions: DatabaseOptions,
    rawCommandOptions: RawCommandOptions,
    options: ClientOptions
  ) {
    super(options);
    this.token = token;
    this.dbOptions = dbOptions;
    this.commands = new Collection<string, COMMANDS>();
    this.rawCommands = new Collection<string, RawCommand>();
    this.rawCommandOptions = rawCommandOptions;
    this.subscriptions = new Collection<string, MusicSubscription>();
    this.collectors = new Collection<
      string,
      InteractionCollector<Interaction>
    >();
  }
  public start() {
    console.log("Starting Bot");
    this.init();
    this.login(this.token);
  }
  public init() {
    console.log("Initializing Bot");
    this.loadCommands();
    this.loadRawCommands();
    this.loadEventListeners();
    this.connectDatabase();
    this.killBot();
  }
  private loadCommands() {
    const commandPath = join(__dirname, "..", "commands");
    console.log(`Loading Commands`);
    const commandFiles = fs
      .readdirSync(commandPath)
      .filter((file) => file.endsWith(".ts") || file.endsWith(".js"));
    //import commands and add to commands property
    for (const file of commandFiles) {
      import(`../commands/${file}`).then((dflt: { default: COMMANDS }) => {
        const command = dflt.default;
        this.commands.set(command.data.name, command);
        console.log(`➕ Adding Command: ${command.data.name}`);
      });
    }
    //add listener for slash command
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
      //Try executing command
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
  private async loadRawCommands() {
    const rawCommandPath = join(__dirname, "..", "rawCommands");
    console.log(`Loading Raw Commands`);
    const rawCommandFiles = fs
      .readdirSync(rawCommandPath)
      .filter((file) => file.endsWith(".ts") || file.endsWith(".js"));
    //import raw command and to raw commands property
    for (const file of rawCommandFiles) {
      await import(`../rawCommands/${file}`).then(
        (dflt: { default: RawCommand }) => {
          const rawCommand = dflt.default;
          this.rawCommands.set(rawCommand.name, rawCommand);
          console.log(`➕ Adding Raw Command: ${rawCommand.name}`);
        }
      );
    }
    //Add listener of raw commands
    this.on("messageCreate", async (message: Message) => {
      if (message.content[0] === this.rawCommandOptions.prefix) {
        const args: string[] = message.content.split(" ");
        const rawCommand: RawCommand = this.rawCommands.get(
          args[0].substring(1)
        );
        if (rawCommand) {
          console.log(
            `Raw Command Triggered: ${
              message.author.tag
            } triggered Raw Command: ${rawCommand.name}, on Server: ${
              message.guild.name
            } in channel #${
              message.guild.channels.cache.get(message.channelId).name
            }\n - ${message.content} `
          );
          //Try executing command
          try {
            rawCommand.execute(message);
          } catch (error) {
            console.error(
              `Error executing command: ${rawCommand.name} - Message: ${message.content} - Error: ${error}`
            );
          }
        }
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
        if (err) throw new Error(`Error Connecting to MongoDB - ERROR: ${err}`);
        console.log(`Connected to MongoDB`);
      }
    );
  }
  killBot() {
    process.on("SIGTERM", () => {
      console.info("SIGTERM singal revieved");
      console.log("Logging off from Discord");
      this.destroy();
      console.log("Logged off");
      console.log("Closing MongoDB Connection");
      mongoose.connection.close(false, (err) => {
        if (err) {
          console.error(err);
          process.exit(1);
        }
        console.log("MongoDB Connection Closed");
        process.exit(0);
      });
    });
  }
}
