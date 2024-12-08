import { ApplyOptions } from '@sapphire/decorators';
import { Args, Command } from '@sapphire/framework';
import { ticketCategory, ticketEmbedColor } from '../lib/constants';
import { EmbedBuilder, Message, TextChannel } from 'discord.js';
import { getOpenTicketByChannelFromCache } from '../lib/cache';
import { ticketMessages, ticketType } from '../schema/tickets';
import { eq } from 'drizzle-orm';
import { createErrorEmbed, getUserRoleInServer } from '../lib/utils';

@ApplyOptions<Command.Options>({
	name: 'edit',
	description: 'Edit a message sent in a modmail thread.',
	preconditions: ['customerServiceOnly']
})
export class EditCommand extends Command {
	public override async messageRun(message: Message, args: Args) {
		const messageChannel = message.channel as TextChannel;
		const noPrefix = await args.rest('string').catch(() => null);

		if (messageChannel.parent && messageChannel.parentId === ticketCategory) {
			const openTicket = (await getOpenTicketByChannelFromCache(messageChannel.id)) as ticketType;

			if (openTicket) {
				if (!message.reference)
					return message.reply({
						embeds: [createErrorEmbed('Sorry, you must reply to a message to edit it.')]
					});

				const deletedMessageRecord = (
					await this.container.db
						.select()
						.from(ticketMessages)
						.where(eq(ticketMessages.supportMsgId, message.reference.messageId ?? '1'))
				)[0];

				if (!deletedMessageRecord)
					return message.reply({
						embeds: [createErrorEmbed('Sorry, I did not find that message in my database.')]
					});

				const clientDms = (await this.container.client.channels.fetch(openTicket.dmId!)) as TextChannel;
				const clientMsg = await clientDms.messages.fetch(deletedMessageRecord.clientMsgId ?? '1')!;
				const supportMsg = await message.channel.messages.fetch(deletedMessageRecord.supportMsgId ?? '1');
				const userRole = await getUserRoleInServer(message.author.id);

				if (clientMsg.author.id !== this.container.client.user!.id)
					return message.reply({
						embeds: [createErrorEmbed('You cannot edit a message sent by a user.')]
					});

				if (!supportMsg)
					return message.reply({
						embeds: [createErrorEmbed('I was unable to find the corresponding message in this channel.')]
					});

				(await supportMsg).edit({
					embeds: [
						new EmbedBuilder()
							.setColor(ticketEmbedColor)
							.setDescription(noPrefix ? noPrefix : '*No content*')
							.setAuthor({
								name: `${message.author.globalName} (@${message.author.username})`,
								iconURL: message.author.avatarURL()!
							})
							.setTimestamp()
							.setFooter({ text: `${userRole} - Edited` })
					],
					files: Array.from(message.attachments.values())
				});

				clientMsg
					.edit({
						embeds: [
							new EmbedBuilder()
								.setColor(ticketEmbedColor)
								.setDescription(noPrefix ? noPrefix : '*No content*')
								.setAuthor({
									name: `${message.author.globalName} (@${message.author.username})`,
									iconURL: message.author.avatarURL()!
								})
								.setTimestamp()
								.setFooter({ text: `${userRole} - Edited` })
						],
						files: Array.from(message.attachments.values())
					})
					.then(() => {
						message.react('✅');
					});
			} else {
				message.reply({
					embeds: [createErrorEmbed("This command can't be run here, this isn't a valid modmail channel.")]
				});
			}
		}

		return;
	}
}
