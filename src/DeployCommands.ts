import fs from "fs";
import { join } from "path";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import {
  clientId,
  guildId,
  token,
  databaseConfig as dbOptions,
} from "./config.json";
import Command, { CommandAbs, CommandType } from "./client/Command";
import SubscribedGuild, {
  SubscribedGuildInterface,
} from "./database/schemas/SubscribedGuilds";
import mongoose, { Error } from "mongoose";

if (process.argv.slice(2)[0] === "-deploy") {
  console.log(`Deploying Slash Commands from CLI!`);
  mongoose.connect(
    `mongodb://${dbOptions.username}:${dbOptions.password}@${dbOptions.url}:${dbOptions.port}/${dbOptions.dbName}?${dbOptions.dbOptions}`,
    {},
    (err: Error) => {
      if (err) throw err;
      console.log(`Connected to MongoDB`);
    }
  );
  //TODO: Make the below function return a promise, when promise resolves then disconnect from the DB.
  refreshCommandsForAll();
  mongoose.disconnect();
}

export function refreshCommandsForAll() {
  console.log(
    "🚀 ~ file: DeployCommands.ts ~ line 18 ~ refreshCommandsForAll ~ refreshCommandsForAll"
  );
  SubscribedGuild.find({}, (err: Error, guilds: SubscribedGuildInterface[]) => {
    if (err)
      throw new Error(
        `Error retrieving all Subsribed Guilds from DB - Error: ${err}`
      );
    if (!guilds) {
      console.log(`Guilds List empty`);
    }
    // else if (guilds) {
    console.log(
      "🚀 ~ file: DeployCommands.ts ~ line 31 ~ refreshCommandsForAll ~ guilds",
      guilds
    );

    publishSlashCommands(guilds);
    // }
  });
}
export function refreshCommandsForGuild(guild: SubscribedGuildInterface) {
  let guilds: SubscribedGuildInterface[];
  guilds.push(guild);
  publishSlashCommands(guilds);
}
function publishSlashCommands(guilds: SubscribedGuildInterface[]) {
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
          console.log("Successfully registered application commands.")
        )
        .catch(console.error);
    });
  });
}
