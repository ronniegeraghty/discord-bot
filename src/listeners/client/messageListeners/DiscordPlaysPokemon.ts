import { Listener } from "discord-akairo";
import { Message } from "discord.js";
import _ from "lodash";
import ks from "node-key-sender";
export default async (listener: Listener, message: Message) => {
  let serverName: string = message.guild.name;
  let author: string = message.author.username;
  function logMessage(controlerInput: string) {
    console.log(`${serverName}: ${author}: ${controlerInput}`);
  }
  if (message.content === "DPP_ON") {
    listener.client.DPP = true;
    return await message.reply(`DISCORD PLAYS POKEMON SYSTEM ON.`);
  }
  if (message.content === "DPP_OFF") {
    listener.client.DPP = false;
    return await message.reply(`DISCORD PLAYS POKEMON SYSTEM OFF.`);
  }
  if (_.toLower(message.content) === "help") {
    return await message.reply(
      `Use this channel to submit GameBoy control commands to the Discord Plays Pokemon System.` +
        `\n**GameBoy Commands:**` +
        `\n**up:** up on D-pad` +
        `\n**down:** down on D-pad` +
        `\n**right:** right on D-pad` +
        `\n**left:** left on D-pad` +
        `\n**a:** A button` +
        `\n**b:** B button` +
        `\n**start:** Start button` +
        `\n**select:** Select button` +
        `\n**rt:** Right trigger` +
        `\n**lt:** Left trigger`
    );
  }
  if (listener.client.DPP) {
    switch (_.toLower(message.content.trim())) {
      case "up":
        logMessage("UP");
        break;
      case "down":
        logMessage("DOWN");
        break;
      case "right":
        logMessage("RIGHT");
        break;
      case "left":
        logMessage("LEFT");
        break;
      case "a":
        logMessage("A");
        ks.sendKey("a");
        break;
      case "b":
        logMessage("B");
        break;
      case "start":
        logMessage("START");
        break;
      case "select":
        logMessage("SELECT");
        break;
      case "rt":
        logMessage("RIGHT TRIGGER");
        break;
      case "lt":
        logMessage("LEFT TRIGGER");
        break;
      default:
        logMessage(`\"${message.content}\" is not a valid option.`);
        break;
    }
  }
};
