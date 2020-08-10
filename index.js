const Discord = require("discord.js");
const bot = new Discord.Client();
require("dotenv").config();

const token = process.env.TOKEN;

const PREFIX = "*";

bot.on("ready", () => {
  console.log("This bot is online");
});

bot.on("message", (msg) => {
  console.log("MESSAGE:", msg.content);
  let args = msg.content.substring(PREFIX.length).split(" ");
  switch (args[0]) {
    case "ping":
      msg.channel.send("pong!");
      break;
    case "website":
      msg.channel.send("https://github.com/ronniegeraghty/Discord_Bot");
      break;
    case "info":
      if (args[1] === "version") {
        msg.channel.send("Version 0.0.0");
      } else {
        msg.channel.send("Invalid Args");
      }
      break;
    case "clear":
      if (!args[1]) return msg.reply("Error please define a second arg");
      msg.channel.bulkDelete(args[1]);
      break;
  }
});

bot.login(token);
