import { Listener } from "discord-akairo";
import { Message } from "discord.js";
import _ from "lodash";
import {exec} from "child_process"
export default async (listener: Listener, message: Message) => {
  let serverName: string = message.guild.name;
  let author: string = message.author.username;
  function logMessage(controlerInput: string) {
    console.log(`${serverName}: ${author}: ${controlerInput}`);
  }
  if (message.content === "DPP_ON" && author === "ronniegerag") {
    listener.client.DPP = true;
    console.log(`DPP SYSTEM ON`);
    return await message.reply(`DISCORD PLAYS POKEMON SYSTEM ON.`);
  }
  if (message.content === "DPP_OFF" && author === "ronniegerag") {
    listener.client.DPP = false;
    console.log(`DPP SYSTEM OFF`);
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
        `\n**r:** Right trigger` +
        `\n**l:** Left trigger`
    );
  }
  if (listener.client.DPP && author !== "Ron_Bot") {
    switch (_.toLower(message.content.trim())) {
      case "up":
        logMessage("UP");
        keyPress("up");
        break;
      case "down":
        logMessage("DOWN");
        keyPress("down");
        break;
      case "right":
        logMessage("RIGHT");
        keyPress("right");
        break;
      case "left":
        logMessage("LEFT");
        keyPress("left");
        break;
      case "a":
        logMessage("A");
        keyPress('a');
        break;
      case "b":
        logMessage("B");
        keyPress("b");
        break;
      case "start":
        logMessage("START");
        keyPress("z");
        break;
      case "select":
        logMessage("SELECT");
        keyPress("x");
        break;
      case "r":
        logMessage("RIGHT TRIGGER");
        keyPress("r");
        break;
      case "l":
        logMessage("LEFT TRIGGER");
        keyPress("l");
        break;
      default:
        logMessage(`\"${message.content}\" is not a valid option.`);
        break;
    }
  }
};

function keyPress(key: string){
  exec(`python ./src/listeners/client/messageListeners/keyboardPress.py ${key}`, (error, stdout, stderr)=>{
    if(error){
      console.log(`exec error: ${error}`);
      return;
    }
    // console.log(`stdout: ${stdout}`);
    // console.log(`stderr: ${stderr}`);
  });
}