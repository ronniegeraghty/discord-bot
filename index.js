const Discord = require("discord.js");
const bot = new Discord.Client();
require("dotenv").config();
const { commandHandler } = require("./commands/commandHandler");

const token = process.env.TOKEN;

const PREFIX = "*";

bot.on("ready", () => {
  console.log("This bot is online");
});

bot.on("message", (msg) => {
  console.log(`MESSAGE: ${msg.content}`);
  if (msg.content.substring(0, 1) === PREFIX) {
    commandHandler(msg);
  }
});

bot.login(token);
// bot.on("message", async (msg) => {
//   console.log("MESSAGE:", msg.content);
//   let args = msg.content.substring(PREFIX.length).split(" ");
//   switch (args[0]) {
//     case "ping":
//       msg.channel.send("pong!");
//       break;
//     case "embed":
//       console.log(msg.author.avatarURL);
//       const embed = new Discord.MessageEmbed()
//         .setTitle("User Information")
//         .addField("Current Server", msg.guild.name)
//         .addField("Player Name", msg.author.username)
//         .setColor(0xf1c40f)
//         .setThumbnail(msg.author.avatarURL());
//       msg.channel.send(embed);
//       break;
//     case "play":
//       function play(connection, msg) {
//         var server = servers[msg.guild.id];
//         server.dispatcher = connection.play(
//           ytdl(server.queue[0], { filter: "audioonly" })
//         );
//         server.queue.shift();
//         server.dispatcher.on("end", () => {
//           if (server.queue[0]) {
//             play(connection, msg);
//           } else {
//             connection.disconnect();
//           }
//         });
//       }

//       if (!args[1]) {
//         msg.reply("You need to provide a link.");
//         break;
//       }
//       if (!msg.member.voice.channel) {
//         msg.reply("You must be in a voice channel to play music.");
//         break;
//       }
//       if (!servers[msg.guild.id]) servers[msg.guild.id] = { queue: [] };
//       var server = servers[msg.guild.id];
//       server.queue.push(args[1]);
//       msg.member.voice.channel.join().then((connection) => {
//         play(connection, msg);
//       });

//       break;
//     case "should":
//       msg.channel.send("No he's a lil bitch.");
//   }
// });
