import { Message } from "discord.js";
import { RawCommand } from "../client/Command";
import SubscribedGuild from "../database/schemas/SubscribedGuilds";
import { refreshCommandsForGuild } from "../DeployCommands";

class AddSlashCommands extends RawCommand {
  public constructor() {
    super("add-slash-commands");
  }
  async execute(message: Message): Promise<void> {
    const { guildId } = message;
    let replyMessage: Promise<Message>;
    try {
      const doc = await SubscribedGuild.findOne({ guildId });
      if (doc)
        replyMessage = message.reply(
          "Server already subscribed to slash commands! Refreshing command list ... "
        );
      if (!doc) {
        const subscribedGuild = new SubscribedGuild({
          guildId: guildId,
        });
        await subscribedGuild.save();
        replyMessage = message.reply(
          "Server now subscribed to slash commands. Uploading slash commands to server ... "
        );
      }
      refreshCommandsForGuild({ guildId: guildId }).then(() => {
        replyMessage.then((resolvedReply) => {
          const { content } = resolvedReply;
          resolvedReply.edit(
            content.substring(0, content.length - 4) +
              ". \nCommands Added to server."
          );
        });
      });
    } catch (err) {
      throw new Error("Error retrieving SubscribtedGuilds from DB: " + err);
    }
  }
}
export default new AddSlashCommands();
