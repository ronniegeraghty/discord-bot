import { Listener } from "discord-akairo";
import { execSync } from "child_process";
import { TIMEOUT } from "dns";
export default class DPPRandomListener extends Listener {
  public constructor() {
    super("dpp_random", {
      emitter: "client",
      event: "dpp_random",
      category: "client",
    });
  }

  public exec() {
    if (this.client.DPP && this.client.DPP_RANDOM) {
      let radNum = Math.floor(Math.random() * 100);
      if (radNum < 25) {
        // a
        logMessage("BOT-SERVER", "Ron_Bot", "A");
        keyPress("a");
      } else if (radNum < 35) {
        //b
        logMessage("BOT-SERVER", "Ron_Bot", "B");
        keyPress("b");
      } else if (radNum < 50) {
        // up
        logMessage("BOT-SERVER", "Ron_Bot", "UP");
        keyPress("up");
      } else if (radNum < 65) {
        //down
        logMessage("BOT-SERVER", "Ron_Bot", "DOWN");
        keyPress("down");
      } else if (radNum < 80) {
        //right
        logMessage("BOT-SERVER", "Ron_Bot", "RIGHT");
        keyPress("right");
      } else if (radNum < 95) {
        //left
        logMessage("BOT-SERVER", "Ron_Bot", "LEFT");
        keyPress("left");
      } else if (radNum > 95) {
        //start
        logMessage("BOT-SERVER", "Ron_Bot", "START");
        keyPress("z");
      }
      setTimeout(() => this.client.emit("dpp_random"), 10);
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

/*
b: 10%
a: 25%
dir: 15&
start: 5%
*/
