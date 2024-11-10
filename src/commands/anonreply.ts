import { ApplyOptions } from '@sapphire/decorators';
import { Args, Command } from '@sapphire/framework';
import { EmbedBuilder, GuildTextBasedChannel, Message } from 'discord.js';
import { ticketEmbedColor } from '../lib/constants';
import { ticketMessages, ticketType } from '../schema/tickets';
import { getOpenTicketByChannelFromCache } from '../lib/cache';

@ApplyOptions<Command.Options>({
	name: 'areply',
	aliases: ['anonreply', 'ar'],
	description: 'Use this command to reply to a modmail ticket anonyomously.'
})
export class ReplyCommand extends Command {
	public override async messageRun(message: Message, args: Args) {
		const messageChannel = message.channel as GuildTextBasedChannel;
		const noPrefix = await args.rest('string').catch(() => null);
		const openTicket = (await getOpenTicketByChannelFromCache(messageChannel.id)) as ticketType;

		if (openTicket) {
			const usrMsg = await this.container.client.users.send(openTicket.authorId, {
				embeds: [
					new EmbedBuilder()
						.setColor(ticketEmbedColor)
						.setDescription(noPrefix ? noPrefix : '*No content*')
						.setAuthor({
							name: `Unify Support (@unifyrbx)`,
							iconURL: this.container.client.user!.avatarURL()!
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
							name: `Unify Support (@unifyrbx)`,
							iconURL: this.container.client.user!.avatarURL()!
						})
						.setTimestamp()
						.setFooter({ text: 'Unify Support' })
				],
				files: Array.from(message.attachments.values())
			});

			await this.container.db.insert(ticketMessages).values({ ticketId: openTicket.id, supportMsgId: staffMsg.id, clientMsgId: usrMsg.id });

			message.delete();
		}
	}
}
