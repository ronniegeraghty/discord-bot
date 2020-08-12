const ytdl = require("ytdl-core");
class Play {
  servers = {};
  command(msg) {
    console.log(`PLAY COMMAND:`);
    this.logServers();
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
    //If the server hasn't been added to servers list
    if (!this.servers[msg.guild.id]) this.servers[msg.guild.id] = { queue: [] };
    var server = this.servers[msg.guild.id];
    server.queue.push(args[1]);
    this.logServers();
    if (server.queue.length <= 1) {
      msg.member.voice.channel.join().then((connection) => {
        this.play(connection, msg);
      });
    }
  }
  play(connection, msg) {
    let server = this.servers[msg.guild.id];
    server.dispatcher = connection.play(
      ytdl(server.queue[0], { filter: "audioonly" })
    );

    server.dispatcher.on("end", () => {
      console.log(`DISPATCHER END`);
      server.queue.shift();
      if (server.queue[0]) {
        this.play(connection, msg);
      } else {
        connection.disconnect();
      }
    });
    this.logServers();
  }
  pause(msg) {
    var dispatcher = this.servers[msg.guild.id].dispatcher;
    dispatcher.pause();
  }
  logServers() {
    console.log(`-----SERVERS-----`);
    for (var server in this.servers) {
      console.log(`SERVER: ${server}`);
      for (var key in this.servers[server]) {
        console.log(`${key}: ${this.servers[server][key]}`);
      }
    }
  }
}

module.exports = new Play();
