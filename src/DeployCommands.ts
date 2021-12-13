import fs from "fs";
import { join } from "path";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { clientId, token, databaseConfig as dbOptions } from "./config.json";
import Command, { CommandAbs, CommandType } from "./client/Command";
import SubscribedGuild, {
  SubscribedGuildInterface,
} from "./database/schemas/SubscribedGuilds";
import mongoose, { Error } from "mongoose";

//Process cli args
switch (process.argv.slice(2)[0]) {
  case "-deploy": {
    console.log(`Deploying Slash Commands from CLI!`);
    mongoose.connect(
      `mongodb://${dbOptions.username}:${dbOptions.password}@${dbOptions.url}:${dbOptions.port}/${dbOptions.dbName}?${dbOptions.dbOptions}`,
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
      `mongodb://${dbOptions.username}:${dbOptions.password}@${dbOptions.url}:${dbOptions.port}/${dbOptions.dbName}?${dbOptions.dbOptions}`,
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
      .filter((file) => file.endsWith(".ts"));
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
