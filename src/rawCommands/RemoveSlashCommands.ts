import { Message } from "discord.js";
import { RawCommand } from "../client/Command";
import SubscribedGuilds, {
  SubscribedGuildInterface,
} from "../database/schemas/SubscribedGuilds";
import { unsubscribeGuildFromCommands } from "../DeployCommands";

class RemoveSlashCommands extends RawCommand {
  public constructor() {
    super("remove-slash-commands");
  }
  async execute(message: Message): Promise<void> {
    const { guildId } = message;
    let replyMessage: Promise<Message>;
    SubscribedGuilds.findOne(
      { guildId },
      async (err: Error, doc: SubscribedGuildInterface) => {
        if (err)
          throw new Error("Error retrieving SubscribedGuilds from DB: " + err);
        if (!doc) {
          replyMessage = message.reply(
            "Server was not subscribed to bot slash commands."
          );
        } else {
          SubscribedGuilds.deleteOne({ guildId }, (error) => {
            if (error) {
              throw new Error("Error removing guild from the DB: " + error);
            } else {
              replyMessage = message.reply(
                "Server now un-subscribed to slash commands. Removing slash commands from server ..."
              );
              unsubscribeGuildFromCommands(doc).then(() => {
                replyMessage.then((resolvedReply) => {
                  const { content } = resolvedReply;
                  resolvedReply.edit(
                    content.substring(0, content.length - 4) +
                      ". \nCommands Removed from Server."
                  );
                });
              });
            }
          });
        }
      }
    );
  }
}
export default new RemoveSlashCommands();
