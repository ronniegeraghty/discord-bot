import { Listener } from "discord-akairo";
import { Message } from "discord.js";
import _ from "lodash";
import { execSync } from "child_process";
export default async (listener: Listener, message: Message) => {
  let serverName: string = message.guild.name;
  let author: string = message.author.username;
  let commands: string[] = parseCommands(message.content);
  commands.forEach(async (command) => {
    await handleCommand(listener, message, author, serverName, command);
  });
};

function keyPress(key: string) {
  execSync(
    `python ./src/listeners/client/messageListeners/keyboardPress.py ${key}`
  );
}

function parseCommands(commandStr: string): string[] {
  let commandArr = commandStr.split(" "); //parse commands by spaces
  let comArrLen = commandArr.length;
  //find commands with direction then number and make them one command
  let newCommandArr: string[] = [];
  for (let i = 0; i < comArrLen - 1; i++) {
    if (isDirectionCommand(commandArr[i]) && isNumeric(commandArr[i + 1])) {
      newCommandArr.push(commandArr[i] + " " + commandArr[i + 1]);
      i++;
    } else {
      newCommandArr.push(commandArr[i]);
    }
  }
  if (!isNumeric(commandArr[comArrLen - 1]))
    newCommandArr.push(commandArr[comArrLen - 1]);
  commandArr = newCommandArr;
  // Limit commands to 3 at a time
  if (commandArr.length > 3) {
    commandArr = commandArr.slice(0, 3);
  }
  return commandArr;
}

function isNumeric(str: string): boolean {
  if (typeof str != "string") return false; // we only process strings!
  return (
    !isNaN(Number(str)) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
    !isNaN(parseFloat(str))
  ); // ...and ensure strings of whitespace fail
}

function isDirectionCommand(str: string): boolean {
  str = _.toLower(str);
  return str === "up" || str === "down" || str === "left" || str === "right";
}

async function handleCommand(
  listener: Listener,
  message: Message,
  author: string,
  serverName: string,
  command: string
) {
  if (command === "DPP_ON" && author === "ronniegerag") {
    listener.client.DPP = true;
    console.log(`DPP SYSTEM ON`);
    return await message.reply(`DISCORD PLAYS POKEMON SYSTEM ON.`);
  }
  if (command === "DPP_OFF" && author === "ronniegerag") {
    listener.client.DPP = false;
    console.log(`DPP SYSTEM OFF`);
    return await message.reply(`DISCORD PLAYS POKEMON SYSTEM OFF.`);
  }
  if (_.toLower(command) === "help") {
    return await message.reply(
      `Use this channel to submit GameBoy control commands to the Discord Plays Pokemon System. Multiple commands can be use by seperating them with a space.` +
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
  let logCom = (com: string) => logMessage(serverName, author, com);
  if (listener.client.DPP && author !== "Ron_Bot") {
    switch (_.toLower(command.trim())) {
      case "up":
        logCom("UP");
        keyPress("up");
        break;
      case "down":
        logCom("DOWN");
        keyPress("down");
        break;
      case "right":
        logCom("RIGHT");
        keyPress("right");
        break;
      case "left":
        logCom("LEFT");
        keyPress("left");
        break;
      case "a":
        logCom("A");
        keyPress("a");
        break;
      case "b":
        logCom("B");
        keyPress("b");
        break;
      case "start":
        logCom("START");
        keyPress("z");
        break;
      case "select":
        logCom("SELECT");
        keyPress("x");
        break;
      case "r":
        logCom("RIGHT TRIGGER");
        keyPress("r");
        break;
      case "l":
        logCom("LEFT TRIGGER");
        keyPress("l");
        break;
      default:
        logCom(`\"${command}\" is not a valid option.`);
        break;
    }
  }
}

function logMessage(
  serverName: string,
  author: string,
  controlerInput: string
) {
  console.log(`${serverName}: ${author}: ${controlerInput}`);
}
