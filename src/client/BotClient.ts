import { AkairoClient, CommandHandler, ListenerHandler } from "discord-akairo";
import {
  BitField,
  BitFieldResolvable,
  Intents,
  IntentsString,
  Message,
} from "discord.js";
import { join } from "path";
import { In } from "typeorm";

interface BotOptions {
  prefix: string;
  token?: string;
  owners?: string | string[];
}
let intents: BitFieldResolvable<IntentsString, number> = [
  Intents.FLAGS.GUILDS,
  // Intents.FLAGS.GUILD_MEMBERS,
  Intents.FLAGS.GUILD_BANS,
  Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
  Intents.FLAGS.GUILD_INTEGRATIONS,
  Intents.FLAGS.GUILD_WEBHOOKS,
  Intents.FLAGS.GUILD_INVITES,
  Intents.FLAGS.GUILD_VOICE_STATES,
  // Intents.FLAGS.GUILD_PRESENCES,
  Intents.FLAGS.GUILD_MESSAGES,
  Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
  Intents.FLAGS.GUILD_MESSAGE_TYPING,
  Intents.FLAGS.DIRECT_MESSAGES,
  Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
  Intents.FLAGS.DIRECT_MESSAGE_TYPING,
];

export default class BotClient extends AkairoClient {
  public config: BotOptions;
  public listenerHandler: ListenerHandler;
  public commandHandler: CommandHandler;
  public constructor(config: BotOptions) {
    super({
      ownerID: config.owners,
      intents: intents,
    });
    this.config = config;
    //Connfigure Listeners
    this.listenerHandler = new ListenerHandler(this, {
      directory: join(__dirname, "..", "listeners"),
    });
    //Configure Command Options
    this.commandHandler = new CommandHandler(this, {
      directory: join(__dirname, "..", "commands"),
      prefix: config.prefix,
      allowMention: true,
      handleEdits: true,
      commandUtil: true,
      commandUtilLifetime: 3e5,
      defaultCooldown: 6e4,
      argumentDefaults: {
        prompt: {
          modifyStart: (_: Message, str: string) =>
            `${str}\n\nType \'cancel\' to cancel the command ...`,
          modifyRetry: (_: Message, str: string) =>
            `${str}\n\nType \'cancel\' to cancel the command ...`,
          timeout: "You took to long, command has been canceled...",
          ended:
            "You exceeded the maximum amount of tries, this command has now been cancelled ...",
          retries: 3,
          time: 3e4,
        },
        otherwise: "",
      },
      ignorePermissions: config.owners,
    });
  }
  public async start(): Promise<string> {
    console.log(
      "🚀 ~ file: BotClient.ts ~ line 51 ~ BotClient ~ start ~ start",
      "Start Method"
    );
    await this.init();
    console.log(
      "🚀 ~ file: BotClient.ts ~ line 56 ~ BotClient ~ start ~ init",
      "Init Finished"
    );
    return this.login(this.config.token);
  }
  private async init(): Promise<void> {
    this.commandHandler.useListenerHandler(this.listenerHandler);
    this.listenerHandler.setEmitters({
      commandHandler: this.commandHandler,
      listenerHandler: this.listenerHandler,
      process,
    });
    this.commandHandler.loadAll();
    this.listenerHandler.loadAll();
  }
}
