import { ApplyOptions } from '@sapphire/decorators';
import { Args, Command } from '@sapphire/framework';
import { EmbedBuilder, GuildTextBasedChannel, Message } from 'discord.js';
import { ticketEmbedColor } from '../lib/constants';
import { getOpenTicketByChannelFromCache } from '../lib/cache';
import { ticketMessages, ticketType } from '../schema/tickets';

@ApplyOptions<Command.Options>({
	name: 'reply',
	aliases: ['r'],
	description: 'Use this command to reply to a modmail ticket.'
})
export class ReplyCommand extends Command {
	public override async messageRun(message: Message, args: Args) {
		const messageChannel = message.channel as GuildTextBasedChannel;
		const noPrefix = await args.rest('string').catch(() => null);
		const openTicket = await getOpenTicketByChannelFromCache(messageChannel.id) as ticketType;

		if (openTicket) {
			const usrMsg = await this.container.client.users.send(openTicket.authorId, {
				embeds: [
					new EmbedBuilder()
						.setColor(ticketEmbedColor)
						.setDescription(noPrefix ? noPrefix : '*No content*')
						.setAuthor({
							name: `${message.author.globalName} (@${message.author.username})`,
							iconURL: message.author.avatarURL()!
						})
						.setTimestamp()
						.setFooter({ text: 'Unify Support' })
				],
				files: Array.from(message.attachments.values())
			});

			const staffMsg = await messageChannel.send({
				embeds: [
					new EmbedBuilder()
						.setColor(ticketEmbedColor)
						.setDescription(noPrefix ? noPrefix : '*No content*')
						.setAuthor({
							name: `${message.author.globalName} (@${message.author.username})`,
							iconURL: message.author.avatarURL()!
						})
						.setTimestamp()
						.setFooter({ text: 'Unify Support' })
				],
				files: Array.from(message.attachments.values())
			});

			await this.container.db
				.insert(ticketMessages)
				.values({ ticketId: openTicket.id, supportMsgId: staffMsg.id, clientMsgId: usrMsg.id })

			message.delete();
		}
	}
}
