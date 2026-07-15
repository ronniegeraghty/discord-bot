import { Client } from "discord.js";
import { logger } from "../logger";

module.exports = {
  name: "clientReady",
  once: true,
  execute(client: Client) {
    logger.info(`Ready! Logged in as ${client.user.tag}`);
  },
};
