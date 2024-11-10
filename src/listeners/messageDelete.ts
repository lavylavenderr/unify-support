import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener } from '@sapphire/framework';
import { EmbedBuilder, Message, TextChannel } from 'discord.js';
import { ticketEmbedColor } from '../lib/constants';
import { ticketMessages, ticketType } from '../schema/tickets';
import { eq } from 'drizzle-orm';
import { getOpenTicketByIdFromCache } from '../lib/cache';

@ApplyOptions<Listener.Options>({
	event: Events.MessageDelete
})
export class messageDeleteEvent extends Listener {
	public override async run(message: Message) {
		if (message.author.id === this.container.client.id) return;

		if (!message.guild) {
			const deletedMessageRecord = (await this.container.db.select().from(ticketMessages).where(eq(ticketMessages.clientMsgId, message.id)))[0];

			if (deletedMessageRecord) {
				const openTicket = (await getOpenTicketByIdFromCache(deletedMessageRecord.ticketId!)) as ticketType;

				if (openTicket) {
					const modmailChannel = (await this.container.client.channels.fetch(openTicket.channelId)) as TextChannel;
					const supportMsg = await modmailChannel.messages.fetch(deletedMessageRecord.supportMsgId!);

					if (!supportMsg) return;

					return supportMsg.edit({
						embeds: [
							new EmbedBuilder()
								.setColor(ticketEmbedColor)
								.setDescription(message.content ? message.content : 'No content provided.')
								.setAuthor({
									name: `${message.author.globalName} (@${message.author.username})`,
									iconURL: message.author.avatarURL()!
								})
								.setTimestamp()
								.setFooter({ text: 'Deleted by User' })
						]
					});
				}
			}
		}

		return;
	}
}
