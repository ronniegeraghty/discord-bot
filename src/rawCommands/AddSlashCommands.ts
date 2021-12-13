import { Message } from "discord.js";
import { RawCommand } from "../client/Command";
import SubscribedGuild, {
  SubscribedGuildInterface,
} from "../database/schemas/SubscribedGuilds";
import { Error } from "mongoose";
import { refreshCommandsForGuild } from "../DeployCommands";

class AddSlashCommands extends RawCommand {
  public constructor() {
    super("add-slash-command");
  }
  async execute(message: Message): Promise<void> {
    const { guildId } = message;
    let replyMessage: Promise<Message>;
    SubscribedGuild.findOne(
      { guildId },
      async (err: Error, doc: SubscribedGuildInterface) => {
        if (err)
          throw new Error("Error retrieving SubscribtedGuilds from DB: " + err);
        if (doc)
          replyMessage = message.reply(
            "Server already subscribed to slash commands! Refreshing command list ... "
          );
        if (!doc) {
          const subsribedGuild = new SubscribedGuild({
            guildId: guildId,
          });
          await subsribedGuild.save();
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
      }
    );
  }
}
export default new AddSlashCommands();
