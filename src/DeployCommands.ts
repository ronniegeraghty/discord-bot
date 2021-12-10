import fs from "fs";
import { join } from "path";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { clientId, guildId, token } from "./config.json";
import Command, { CommandAbs, CommandType } from "./client/Command";

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
  rest
    .put(Routes.applicationGuildCommands(clientId, guildId), {
      body: resolvedCommands,
    })
    .then(() => console.log("Successfully registered application commands."))
    .catch(console.error);
});
