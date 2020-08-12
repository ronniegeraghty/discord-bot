const play = require("./play");

/**
 *
 * @param {Object} msg - Discord Message Object
 */
function commandHandler(msg) {
  const command = msg.content.substring(1);
  console.log(`COMMAND: ${command}`);
  let args = command.split(" ");
  switch (args[0]) {
    case "play":
      play.command(msg);
      break;
    case "pause":
      play.pause();
      break;
  }
}
module.exports.commandHandler = commandHandler;
