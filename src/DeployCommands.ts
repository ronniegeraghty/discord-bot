import fs from "fs";
import { join } from "path";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import Command, {
  CommandAbs,
  CommandType,
  RawCommandOptions,
} from "./client/Command";
import SubscribedGuild, {
  SubscribedGuildInterface,
} from "./database/schemas/SubscribedGuilds";
import mongoose, { Error } from "mongoose";
import * as dotenv from "dotenv";
import { DatabaseOptions } from "./database/DatabaseOptions.type";
dotenv.config();

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const dbConfig: DatabaseOptions = {
  username: process.env.MONGO_ROOT_USER,
  password: process.env.MONGO_ROOT_PASSWORD,
  url:
    process.env.ENV === "CONTAINER" ? process.env.MONGO_HOST_NAME : "localhost",
  port: process.env.MONGO_INTERNAL_PORT,
  dbName: process.env.MONGO_DATABASE,
  dbOptions: process.env.MONGO_OPTIONS,
};

const rawCommandOptions: RawCommandOptions = {
  prefix: process.env.PREFIX,
};

//Process cli args
switch (process.argv.slice(2)[0]) {
  case "-deploy": {
    console.log(`Deploying Slash Commands from CLI!`);
    mongoose.connect(
      `mongodb://${dbConfig.username}:${dbConfig.password}@${dbConfig.url}:${dbConfig.port}/${dbConfig.dbName}?${dbConfig.dbOptions}`,
      {},
      (err: Error) => {
        if (err) throw err;
        console.log(`Connected to MongoDB`);
      }
    );
    refreshCommandsForAll().then((value) => {
      console.log(`Disconnecting from DB.`);
      mongoose.disconnect();
    });
    break;
  }
  case "-wipe": {
    console.log(`Wiping Slash Commands from CLI!`);
    mongoose.connect(
      `mongodb://${dbConfig.username}:${dbConfig.password}@${dbConfig.url}:${dbConfig.port}/${dbConfig.dbName}?${dbConfig.dbOptions}`,
      {},
      (err: Error) => {
        if (err) throw err;
        console.log(`Connected to MongoDB`);
      }
    );
    unsubscribeAllFromCommands().then((value) => {
      console.log(`Disconnecting from DB.`);
      mongoose.disconnect();
    });
    break;
  }
  default: {
    break;
  }
}

export function refreshCommandsForAll(): Promise<void> {
  return new Promise((resolve) => {
    SubscribedGuild.find(
      {},
      (err: Error, guilds: SubscribedGuildInterface[]) => {
        if (err)
          throw new Error(
            `Error retrieving all Subsribed Guilds from DB - Error: ${err}`
          );
        if (!guilds) {
          console.log(`Guilds List empty`);
        }
        if (guilds) publishSlashCommands(guilds).then(() => resolve());
      }
    );
  });
}
export function refreshCommandsForGuild(
  guild: SubscribedGuildInterface
): Promise<void> {
  return new Promise((resolve) => {
    let guilds: SubscribedGuildInterface[] = [];
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
      console.log(`Commands to be uploaded: `, resolvedCommands);
      const rest = new REST({ version: "9" }).setToken(token);
      guilds.forEach((guild: SubscribedGuildInterface) => {
        console.log(` - Refreshing commands for Server: ${guild.guildId}`);
        rest
          .put(Routes.applicationGuildCommands(clientId, guild.guildId), {
            body: resolvedCommands,
          })
          .then(() =>
            console.log(
              ` - Successfully registered application commands for ${guild.guildId}`
            )
          )
          .then(() => resolve())
          .catch(console.error);
      });
    });
  });
}
export function unsubscribeAllFromCommands(): Promise<void> {
  return new Promise((resolve) => {
    SubscribedGuild.find(
      {},
      (err: Error, guilds: SubscribedGuildInterface[]) => {
        if (err)
          throw new Error(
            `Error retrieving all Subsribed Guilds from DB - Error: ${err}`
          );
        if (!guilds) {
          console.log(`Guilds List empty`);
        }
        if (guilds) unsubscribeFromCommands(guilds).then(() => resolve());
      }
    );
  });
}
export function unsubscribeGuildFromCommands(
  guild: SubscribedGuildInterface
): Promise<void> {
  return new Promise((resolve) => {
    let guilds: SubscribedGuildInterface[] = [];
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
    const rest = new REST({ version: "9" }).setToken(token);
    guilds.forEach((guild: SubscribedGuildInterface) => {
      console.log(` - Wiping commands for Server: ${guild.guildId}`);
      rest
        .put(Routes.applicationGuildCommands(clientId, guild.guildId), {
          body: commands,
        })
        .then(() =>
          console.log(
            ` - Successfully wipied application commands for ${guild.guildId}`
          )
        )
        .then(() => resolve())
        .catch(console.error);
    });
  });
}
