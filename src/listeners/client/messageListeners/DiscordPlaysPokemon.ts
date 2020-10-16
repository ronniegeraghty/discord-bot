import { Listener } from "discord-akairo";
import { Message } from "discord.js";
import _ from "lodash";
import { execSync } from "child_process";
import { commandList, commandControlMap } from "./DPPCommands";
export default async (listener: Listener, message: Message) => {
  let serverName: string = message.guild.name;
  let author: string = message.author.username;
  let commands: string[] = parseCommands(message.content);
  commands.forEach(async (command) => {
    await handleCommand(listener, message, author, serverName, command);
  });
};

function parseCommands(commandStr: string): string[] {
  let commandArr = commandStr.split(" "); //parse commands by spaces
  let comArrLen = commandArr.length;
  //find commands with direction then number and make them one command
  let newCommandArr: string[] = [];
  for (let i = 0; i < comArrLen - 1; i++) {
    if (isNumeric(commandArr[i + 1])) {
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
      `Use this channel to submit GameBoy control commands to the Discord Plays Pokemon System. ` +
        `Multiple commands can be use by seperating them with a space. \n**ex: up down right**\n` +
        `Adding a number behind a command will execute that command that many times. \n**ex: up 5**\n` +
        `The max number is 10.` +
        `\n**GameBoy Commands:**` +
        `\n**up, u:** up on D-pad` +
        `\n**down, d:** down on D-pad` +
        `\n**right, r:** right on D-pad` +
        `\n**left, l:** left on D-pad` +
        `\n**a:** A button` +
        `\n**b:** B button` +
        `\n**start:** Start button` +
        `\n**select:** Select button` +
        `\n**rt:** Right trigger` +
        `\n**lt:** Left trigger`
    );
  }

  let comArr: string[] = command.split(" ");
  comArr[0] = _.toLower(comArr[0]);
  if (listener.client.DPP && author !== "Ron_Bot") {
    execCommand(comArr, serverName, author);
  }
}

function handleNumMultiplier(comArr: string[]): number {
  if (comArr[1]) {
    let multiplier: number = Number(comArr[1]);
    if (multiplier) {
      if (multiplier > 10) multiplier = 10;
      else if (multiplier < 1) multiplier = 1;
      return multiplier;
    }
    return 1;
  }
  return 1;
}

function execCommand(comArr: string[], serverName: string, author: string) {
  if (!commandList[comArr[0]]) {
    logMessage(serverName, author, `${comArr[0]} is not a valid command.`);
    return;
  } else {
    let multipler: number = handleNumMultiplier(comArr);
    let command: string = commandControlMap[commandList[comArr[0]]];
    for (let i = 0; i < multipler; i++) {
      logMessage(serverName, author, commandList[comArr[0]]);
      keyPress(command);
    }
  }
}

function keyPress(key: string) {
  execSync(
    `python ./src/listeners/client/messageListeners/keyboardPress.py ${key}`
  );
}

function logMessage(
  serverName: string,
  author: string,
  controlerInput: string
) {
  console.log(`${serverName}: ${author}: ${controlerInput}`);
}
