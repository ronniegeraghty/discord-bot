# Ron_Bot
A discord bot made using Node.js, discord.js, the discord-akairo framework, and typescript. 

## Features:
- Music playback
- Warn members
- Ping the Bot

### Prereqs: 
- Node.js

## Install & Setup: 
Open a terminal and type the following commands: 
```
git clone https://github.com/ronniegeraghty/Discord_Bot.git
cd Discord_Bot
npm install
```
Then copy the `Config.ts.example` file and rename it `Config.ts`. Using the example template enter the token for your Discord Bot, the prefix you would like to use for your commands, and the name for the database that the bot will use. You can leave owners blank. 

Then run the following commands in the terminal. 
```
npm run build
npm run start
```
When you see `Your_Bot#0000 is now online and ready!` in the terminal the bot is up and running. 