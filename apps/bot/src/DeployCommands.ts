import fs from "fs";
import { join } from "path";
import { REST, Routes } from "discord.js";
import Command, { CommandAbs, CommandType } from "./client/Command";
import SubscribedGuild, {
  SubscribedGuildInterface,
} from "./database/schemas/SubscribedGuilds";
import mongoose from "mongoose";
import { config } from "./config";
import { logger } from "./logger";

const token = config.discordToken;
const clientId = config.clientId;
const dbConfig = config.databaseOptions;

//Process cli args
switch (process.argv.slice(2)[0]) {
  case "-deploy": {
    logger.info("Deploying slash commands from CLI");
    mongoose
      .connect(
        `mongodb://${dbConfig.username}:${dbConfig.password}@${dbConfig.url}:${dbConfig.port}/${dbConfig.dbName}?${dbConfig.dbOptions}`
      )
      .then(() => {
        logger.info("Connected to MongoDB");
        return refreshCommandsForAll();
      })
      .then(() => {
        logger.info("Disconnecting from DB");
        return mongoose.disconnect();
      })
      .catch((err) => {
        throw err;
      });
    break;
  }
  case "-wipe": {
    logger.info("Wiping slash commands from CLI");
    mongoose
      .connect(
        `mongodb://${dbConfig.username}:${dbConfig.password}@${dbConfig.url}:${dbConfig.port}/${dbConfig.dbName}?${dbConfig.dbOptions}`
      )
      .then(() => {
        logger.info("Connected to MongoDB");
        return unsubscribeAllFromCommands();
      })
      .then(() => {
        logger.info("Disconnecting from DB");
        return mongoose.disconnect();
      })
      .catch((err) => {
        throw err;
      });
    break;
  }
  default: {
    break;
  }
}

export async function refreshCommandsForAll(): Promise<void> {
  const guilds = await SubscribedGuild.find({});
  if (!guilds || guilds.length === 0) {
    logger.info("Guilds list empty");
    return;
  }
  await publishSlashCommands(guilds);
}
export function refreshCommandsForGuild(
  guild: SubscribedGuildInterface
): Promise<void> {
  return new Promise((resolve) => {
    const guilds: SubscribedGuildInterface[] = [];
    guilds.push(guild);
    publishSlashCommands(guilds).then(() => resolve());
  });
}
function publishSlashCommands(
  guilds: SubscribedGuildInterface[]
): Promise<void> {
  return new Promise((resolve) => {
    const commandPath = join(__dirname, "commands");
    const commands = [];
    const commandFiles = fs
      .readdirSync(commandPath)
      .filter((file) => file.endsWith(".ts") || file.endsWith(".js"));
    for (const file of commandFiles) {
      commands.push(
        import(`./commands/${file}`).then(
          (dflt: { default: Command | CommandAbs | CommandType }) => {
            const command = dflt.default;
            return command.data.toJSON();
          }
        )
      );
    }
    Promise.all(commands).then((resolvedCommands) => {
      logger.info(`Uploading ${resolvedCommands.length} command(s)`);
      const rest = new REST({ version: "10" }).setToken(token);
      guilds.forEach((guild: SubscribedGuildInterface) => {
        logger.info(`Refreshing commands for guild ${guild.guildId}`);
        rest
          .put(Routes.applicationGuildCommands(clientId, guild.guildId), {
            body: resolvedCommands,
          })
          .then(() =>
            logger.info(
              `Successfully registered application commands for ${guild.guildId}`
            )
          )
          .then(() => resolve())
          .catch((err) =>
            logger.error({ err }, "Failed to register application commands")
          );
      });
    });
  });
}
export async function unsubscribeAllFromCommands(): Promise<void> {
  const guilds = await SubscribedGuild.find({});
  if (!guilds || guilds.length === 0) {
    logger.info("Guilds list empty");
    return;
  }
  await unsubscribeFromCommands(guilds);
}
export function unsubscribeGuildFromCommands(
  guild: SubscribedGuildInterface
): Promise<void> {
  return new Promise((resolve) => {
    const guilds: SubscribedGuildInterface[] = [];
    guilds.push(guild);
    unsubscribeFromCommands(guilds).then(() => resolve());
  });
}
export function unsubscribeFromCommands(
  guilds: SubscribedGuildInterface[]
): Promise<void> {
  return new Promise((resolve) => {
    //empty commands array
    const commands = [];
    const rest = new REST({ version: "10" }).setToken(token);
    guilds.forEach((guild: SubscribedGuildInterface) => {
      logger.info(`Wiping commands for guild ${guild.guildId}`);
      rest
        .put(Routes.applicationGuildCommands(clientId, guild.guildId), {
          body: commands,
        })
        .then(() =>
          logger.info(
            `Successfully wiped application commands for ${guild.guildId}`
          )
        )
        .then(() => resolve())
        .catch((err) =>
          logger.error({ err }, "Failed to wipe application commands")
        );
    });
  });
}
