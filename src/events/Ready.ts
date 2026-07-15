import { Client } from "discord.js";

module.exports = {
  name: "clientReady",
  once: true,
  execute(client: Client) {
    console.log(`Ready! Logged in as ${client.user.tag}`);
  },
};
