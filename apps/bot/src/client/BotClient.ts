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
import { logger } from "../logger";

export default class BotClient extends Client {
  public dbOptions: DatabaseOptions;
  public commands: Collection<string, COMMANDS>;
  public rawCommands: Collection<string, RawCommand>;
  public rawCommandOptions: RawCommandOptions;
  public subscriptions: Collection<string, MusicSubscription>;
  public collectors: Collection<string, InteractionCollector<any>>;
  private shuttingDown = false;
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
    logger.info("Starting Bot");
    this.init();
    this.login(this.token);
  }
  public init() {
    logger.info("Initializing Bot");
    this.loadCommands();
    this.loadRawCommands();
    this.loadEventListeners();
    this.connectDatabase();
    this.killBot();
  }
  private loadCommands() {
    const commandPath = join(__dirname, "..", "commands");
    logger.info("Loading Commands");
    const commandFiles = fs
      .readdirSync(commandPath)
      .filter((file) => file.endsWith(".ts") || file.endsWith(".js"));
    //import commands and add to commands property
    for (const file of commandFiles) {
      import(`../commands/${file}`).then((dflt: { default: COMMANDS }) => {
        const command = dflt.default;
        this.commands.set(command.data.name, command);
        logger.info(`Adding command: ${command.data.name}`);
      });
    }
    //add listener for slash command
    this.on("interactionCreate", async (interaction) => {
      if (!interaction.isChatInputCommand()) return;
      const command = this.commands.get(interaction.commandName);
      if (!command) return;
      const location = interaction.guild ? ` on ${interaction.guild.name}` : "";
      logger.info(
        `Command triggered: ${interaction.user.tag} used /${command.data.name}${location}`
      );
      //Execute the command, catching both sync throws and async rejections
      try {
        await command.execute(interaction);
      } catch (error) {
        logger.error(
          { err: error },
          `Error executing command /${interaction.commandName}`
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
      logger.error(
        { err },
        `Failed to send error reply for /${interaction.commandName}`
      );
    }
  }
  private async loadRawCommands() {
    const rawCommandPath = join(__dirname, "..", "rawCommands");
    logger.info("Loading Raw Commands");
    const rawCommandFiles = fs
      .readdirSync(rawCommandPath)
      .filter((file) => file.endsWith(".ts") || file.endsWith(".js"));
    //import raw command and to raw commands property
    for (const file of rawCommandFiles) {
      await import(`../rawCommands/${file}`).then(
        (dflt: { default: RawCommand }) => {
          const rawCommand = dflt.default;
          this.rawCommands.set(rawCommand.name, rawCommand);
          logger.info(`Adding raw command: ${rawCommand.name}`);
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
          logger.info(
            `Raw command triggered: ${message.author.tag} used ${rawCommand.name}: ${message.content}`
          );
          //Execute the raw command, catching sync throws and async rejections
          try {
            await rawCommand.execute(message);
          } catch (error) {
            logger.error(
              { err: error },
              `Error executing raw command ${rawCommand.name}`
            );
          }
        }
      }
    });
  }
  private loadEventListeners() {
    logger.info("Loading Event Listeners");
    const eventPath = join(__dirname, "..", "events");
    const eventFiles = fs
      .readdirSync(eventPath)
      .filter((file) => file.endsWith(".ts") || file.endsWith(".js"));
    for (const file of eventFiles) {
      import(`../events/${file}`).then((event) => {
        logger.info(`Adding event listener: ${event.name}`);
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
      logger.info("Connected to MongoDB");
    } catch (err) {
      throw new Error(`Error Connecting to MongoDB - ERROR: ${err}`);
    }
  }
  private killBot() {
    const shutdown = async (signal: string) => {
      // Ignore repeat signals so shutdown only runs once.
      if (this.shuttingDown) return;
      this.shuttingDown = true;
      logger.info(`${signal} received - shutting down gracefully`);
      // Never let a stuck shutdown hang the process forever.
      const forceExit = setTimeout(() => {
        logger.error("Graceful shutdown timed out - forcing exit");
        process.exit(1);
      }, 10000);
      forceExit.unref();
      try {
        logger.info("Logging off from Discord");
        await this.destroy();
        logger.info("Closing MongoDB connection");
        await mongoose.connection.close();
        logger.info("Shutdown complete");
        clearTimeout(forceExit);
        process.exit(0);
      } catch (err) {
        logger.error({ err }, "Error during shutdown");
        clearTimeout(forceExit);
        process.exit(1);
      }
    };
    process.once("SIGTERM", () => shutdown("SIGTERM"));
    process.once("SIGINT", () => shutdown("SIGINT"));
  }
}
