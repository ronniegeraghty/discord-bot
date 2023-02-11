import { Client, Collection, GatewayIntentBits } from "discord.js";
import { join } from "path";
import fs from "fs";
import { Command } from "./Command";

export default class BotClient extends Client {
    private authToken: string;
    public commands: Collection<string, Command>;
    public constructor(token: string) {
        super({ intents: [GatewayIntentBits.Guilds] });
    }
    public start() {
        console.log("Starting Bot");
        this.init();
        this.login(this.token);
    }
    private init() {
        this.loadCommands();
        this.loadEventListeners();
    }
    private loadCommands() {
        console.log(`Loading Commands`);
        const commandPath = join(__dirname, '../commands');
        const commandFiles = fs.readdirSync(commandPath).filter((file) => file.endsWith(".ts") || file.endsWith(".js"));
        //import commands and add to commands property
        for (const file of commandFiles) {
            import(join(commandPath, file)).then((dftl: { default: Command; }) => {
                const command = dftl.default;
                this.commands.set(command.data.name, command);
                console.log(`+ Adding Command: ${command.data.name}`);
            });
        }
        //add listeners for slash command
        this.on('interactionCreate', async (interaction) => {
            if (!interaction.isCommand()) return;
            const command = this.commands.get(interaction.commandName);
            if (!command) return;
            console.log(`Command Triggered: ${interaction.user.tag} triggered command: ${command.data.name}, on Server: ${interaction.guild.name} in channel #${interaction.guild.channels.cache.get(interaction.channelId).name}\n - ${interaction}`);
            // Try executing the command
            try {
                command.execute(interaction);
            } catch (error) {
                console.log(`ERROR executing command: ${interaction.commandName} - Error: ${error}`);
                await interaction.reply({ content: "There was an error while executing this command!", ephemeral: true });
            }
        });
    }
    private loadEventListeners() {
        this.on('ready', () => {
            console.log(`Logged in as ${this.user.tag}!`);
        });
    }
}