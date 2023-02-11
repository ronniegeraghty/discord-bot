import { Client, ClientOptions, GatewayIntentBits } from "discord.js";
import { join } from "path";
import fs from "fs";

export default class BotClient extends Client {
    private authToken: string;
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
    }
    private loadEventListeners() {
        this.on('ready', () => {
            console.log(`Logged in as ${this.user.tag}!`);
        });
    }
}