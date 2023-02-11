import BotClient from './client/BotClient';
import * as dotenv from 'dotenv';
dotenv.config();

const bot = new BotClient(process.env.DISCORD_TOKEN);
bot.start();
