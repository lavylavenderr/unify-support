import { ticketEmbedColor } from "@constants";
import { EmbedBuilder, type TextChannel } from "discord.js";
import { client, db } from "index";
import { ticketMessages } from "schema/tickets";
import { defineTextCommand, TextCommand } from "structs/TextCommand";
import {
  fetchTicketById,
  getHighestRole,
  returnErrorEmbed,
} from "util/ticketUtils";

const schema = defineTextCommand({
  name: "reply",
  description: "Reply to a modmail thread.",
  aliases: ["r"],
});

export default new TextCommand(schema, async (message, args) => {
  const msgChannel = message.channel as TextChannel;
  const msgContent = args.rest();
  const existingTicket = await fetchTicketById(msgChannel.id);

  if (existingTicket) {
    const userRole = await getHighestRole(message.author.id);
    const usrDisplayName = message.author.globalName
      ? `${message.author.globalName} (@${message.author.username})`
      : message.author.username;

    try {
      const usrMsg = await client.users.send(existingTicket.authorId, {
        embeds: [
          new EmbedBuilder()
            .setColor(ticketEmbedColor)
            .setDescription(msgContent ? msgContent : "*No content*")
            .setAuthor({
              name: usrDisplayName,
              iconURL: message.author.avatarURL()!,
            })
            .setTimestamp()
            .setFooter({ text: userRole }),
        ],
        files: Array.from(message.attachments.values()),
      });

      const staffMsg = await msgChannel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(ticketEmbedColor)
            .setDescription(msgContent ? msgContent : "*No content*")
            .setAuthor({
              name: usrDisplayName,
              iconURL: message.author.avatarURL()!,
            })
            .setTimestamp()
            .setFooter({ text: userRole }),
        ],
        files: Array.from(message.attachments.values()),
      });

      await message.delete();
      return db.insert(ticketMessages).values({
        ticketId: existingTicket.id,
        supportMsgId: staffMsg.id,
        clientMsgId: usrMsg.id,
      });
    } catch (err) {
      console.log(err)
      return message.reply({
        embeds: [
          returnErrorEmbed(
            "Sorry, I encountered an error while replying to the ticket. The user may have left the server or there was an issue with sending the message."
          ),
        ],
      });
    }
  } else {
    return message.reply({
      embeds: [returnErrorEmbed("This is not a valid modmail channel.")],
    });
  }
});
