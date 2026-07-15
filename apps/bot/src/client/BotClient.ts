import { join } from "path";
import fs from "fs";
import {
  ChatInputCommandInteraction,
  Client,
  ClientOptions,
  Collection,
  InteractionCollector,
  InteractionReplyOptions,
  Message,
  MessageFlags,
} from "discord.js";
import { COMMANDS, RawCommand, RawCommandOptions } from "./Command";
import mongoose from "mongoose";
import { DatabaseOptions } from "../database/DatabaseOptions";
import MusicSubscription from "./Subscription";

export default class BotClient extends Client {
  public dbOptions: DatabaseOptions;
  public commands: Collection<string, COMMANDS>;
  public rawCommands: Collection<string, RawCommand>;
  public rawCommandOptions: RawCommandOptions;
  public subscriptions: Collection<string, MusicSubscription>;
  public collectors: Collection<string, InteractionCollector<any>>;
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
    this.collectors = new Collection<string, InteractionCollector<any>>();
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
      if (!interaction.isChatInputCommand()) return;
      const command = this.commands.get(interaction.commandName);
      if (!command) return;
      const location = interaction.guild ? ` on ${interaction.guild.name}` : "";
      console.log(
        `Command Triggered: ${interaction.user.tag} triggered /${command.data.name}${location}`
      );
      //Execute the command, catching both sync throws and async rejections
      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(
          `Error executing command /${interaction.commandName}:`,
          error
        );
        await this.replyWithError(interaction);
      }
    });
  }
  private async replyWithError(interaction: ChatInputCommandInteraction) {
    const payload: InteractionReplyOptions = {
      content: "There was an error while executing this command!",
      flags: MessageFlags.Ephemeral,
    };
    try {
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(payload);
      } else {
        await interaction.reply(payload);
      }
    } catch (err) {
      console.error(
        `Failed to send error reply for /${interaction.commandName}:`,
        err
      );
    }
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
            `Raw Command Triggered: ${message.author.tag} triggered ${rawCommand.name}: ${message.content}`
          );
          //Execute the raw command, catching sync throws and async rejections
          try {
            await rawCommand.execute(message);
          } catch (error) {
            console.error(
              `Error executing raw command ${rawCommand.name}:`,
              error
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
  private async connectDatabase() {
    try {
      await mongoose.connect(
        `mongodb://${this.dbOptions.username}:${this.dbOptions.password}@${this.dbOptions.url}:${this.dbOptions.port}/${this.dbOptions.dbName}?${this.dbOptions.dbOptions}`
      );
      console.log(`Connected to MongoDB`);
    } catch (err) {
      throw new Error(`Error Connecting to MongoDB - ERROR: ${err}`);
    }
  }
  killBot() {
    process.on("SIGTERM", async () => {
      console.info("SIGTERM signal received");
      console.log("Logging off from Discord");
      await this.destroy();
      console.log("Logged off");
      console.log("Closing MongoDB Connection");
      try {
        await mongoose.connection.close();
        console.log("MongoDB Connection Closed");
        process.exit(0);
      } catch (err) {
        console.error(err);
        process.exit(1);
      }
    });
  }
}
