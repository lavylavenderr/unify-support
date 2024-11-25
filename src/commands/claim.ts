import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { EmbedBuilder, Message, TextChannel } from 'discord.js';
import { flushCache, getOpenTicketByChannelFromCache } from '../lib/cache';
import { tickets, ticketType } from '../schema/tickets';
import { ticketEmbedColor, ticketTopicMsg } from '../lib/constants';
import { eq } from 'drizzle-orm';

@ApplyOptions<Command.Options>({
	name: 'claim',
	description: 'Claim a ticket.'
})
export class ClaimCommand extends Command {
	public override async messageRun(message: Message) {
		const messageChannel = message.channel as TextChannel;
		const openTicket = (await getOpenTicketByChannelFromCache(messageChannel.id)) as ticketType;

		if (openTicket) {
			if (openTicket.claimedBy)
				return message.reply({
					embeds: [
						new EmbedBuilder()
							.setDescription(
								`This ticket is already claimed by <@${openTicket.claimedBy}> and cannot be claimed. If you need to override this, inform an executive.`
							)
							.setColor(ticketEmbedColor)
					]
				});

			await this.container.db.update(tickets).set({ claimedBy: message.author.id }).where(eq(tickets.id, openTicket.id));
			flushCache();

			await messageChannel.setTopic('Claimed By: ' + message.author.globalName + ' | ' + ticketTopicMsg);
			return message.reply({
				embeds: [
					new EmbedBuilder()
						.setColor(ticketEmbedColor)
						.setDescription(`This ticket has been claimed by <@${message.author.id}> and they will be assisting the client.`)
				]
			});
		} else {
			return message.reply({
				embeds: [new EmbedBuilder().setDescription("This isn't a modmail ticket silly, you cannot claim this.").setColor(ticketEmbedColor)]
			});
		}
	}
}
