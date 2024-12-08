import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { EmbedBuilder, Message, TextChannel } from 'discord.js';
import { ticketCategory, ticketEmbedColor } from '../lib/constants';
import { getOpenTicketByChannelFromCache } from '../lib/cache';
import { ticketMessages, ticketType } from '../schema/tickets';
import { eq } from 'drizzle-orm';
import { createErrorEmbed } from '../lib/utils';

@ApplyOptions<Command.Options>({
	name: 'delete',
	description: 'Delete a message sent by a staff member.',
	preconditions: ['customerServiceOnly']
})
export class DeleteCommand extends Command {
	public override async messageRun(message: Message) {
		const messageChannel = message.channel as TextChannel;

		if (messageChannel.parent && messageChannel.parentId === ticketCategory) {
			const openTicket = (await getOpenTicketByChannelFromCache(messageChannel.id)) as ticketType;

			if (openTicket) {
				if (!message.reference)
					return message.reply({
						embeds: [new EmbedBuilder().setDescription('Sorry, you must reply to a message to delete.').setColor(ticketEmbedColor)]
					});

				const deletedMessageRecord = (
					await this.container.db
						.select()
						.from(ticketMessages)
						.where(eq(ticketMessages.supportMsgId, message.reference.messageId ?? '1'))
				)[0];

				if (!deletedMessageRecord)
					return message.reply({
						embeds: [new EmbedBuilder().setDescription('Sorry, I did not find that message in my database.').setColor(ticketEmbedColor)]
					});

				const clientDms = (await this.container.client.channels.fetch(openTicket.dmId!)) as TextChannel;
				const clientMsg = await clientDms.messages.fetch(deletedMessageRecord.clientMsgId!)!;
				const supportMsg = await message.channel.messages.fetch(deletedMessageRecord.supportMsgId! ?? '1');

				if (clientMsg.author.id !== this.container.client.user!.id)
					return message.reply({
						embeds: [createErrorEmbed('You cannot delete a message sent by a user.')]
					});

				if (!supportMsg)
					return message.reply({
						embeds: [createErrorEmbed('I was unable to find the corresponding message in this channel.')]
					});

				(await clientMsg).delete();
				(await supportMsg).delete();
				(await message).delete();
			} else {
				return message.reply({
					embeds: [createErrorEmbed("This command can't be run here, this isn't a valid modmail channel.")]
				});
			}
		}

		return;
	}
}
