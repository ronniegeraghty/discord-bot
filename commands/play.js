class Play {
  servers = {};
  command(msg) {
    console.log(`PLAY COMMAND:`);
    let args = msg.content.substring(1).split(" ");
    if (!this.servers[msg.guild.id]) this.servers[msg.guild.id] = { queue: [] };
    console.log(`SERVERS: ${JSON.stringify(this.servers)}`);
    var server = this.servers[msg.guild.id];
    server.dispatcher = connection.play();
  }
}

module.exports = new Play();
