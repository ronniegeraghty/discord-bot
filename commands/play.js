const ytdl = require("ytdl-core");
class Play {
  servers = {};
  command(msg) {
    console.log(`PLAY COMMAND:`);
    let args = msg.content.substring(1).split(" ");
    //If no link included
    if (!args[1]) {
      msg.reply("You need to provide a link.");
      return;
    }
    //If the user is not in a voice channel
    if (!msg.member.voice.channel) {
      msg.reply("You must be in a voice channel to play music.");
      return;
    }
    if (!this.servers[msg.guild.id]) this.servers[msg.guild.id] = { queue: [] };
    var server = this.servers[msg.guild.id];
    server.queue.push(args[1]);
    msg.member.voice.channel.join().then((connection) => {
      this.play(connection, msg);
    });
  }
  play(connection, msg) {
    let server = this.servers[msg.guild.id];
    server.dispatcher = connection.play(
      ytdl(server.queue[0], { filter: "audioonly" })
    );
    server.queue.shift();
    server.dispatcher.on("end", () => {
      if (server.queue[0]) {
        this.play(connection, msg);
      } else {
        connection.disconnect();
      }
    });
  }
}

module.exports = new Play();
