import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { EmbedBuilder, Message, TextChannel } from 'discord.js';
import { flushCache, getOpenTicketByChannelFromCache } from '../lib/cache';
import { tickets, ticketType } from '../schema/tickets';
import { ticketEmbedColor, ticketTopicMsg } from '../lib/constants';
import { eq } from 'drizzle-orm';

@ApplyOptions<Command.Options>({
	name: 'unassign',
	description: 'Unassign a ticket.',
	preconditions: ['executiveOnly']
})
export class UnassignCommand extends Command {
	public override async messageRun(message: Message) {
		const messageChannel = message.channel as TextChannel;
		const openTicket = (await getOpenTicketByChannelFromCache(messageChannel.id)) as ticketType;

		if (openTicket) {
			if (!openTicket.claimedBy)
				return message.reply({
					embeds: [new EmbedBuilder().setDescription(`This ticket hasn't been claimed.`).setColor(ticketEmbedColor)]
				});

			await this.container.db.update(tickets).set({ claimedBy: null }).where(eq(tickets.id, openTicket.id));;
			flushCache();

			messageChannel.setTopic('Claimed By: Nobody | ' + ticketTopicMsg);
			return message.reply({
				embeds: [
					new EmbedBuilder().setColor(ticketEmbedColor).setDescription(`<@${openTicket.claimedBy}> has been unassigned from this ticket.`)
				]
			});
		} else {
			return message.reply({
				embeds: [new EmbedBuilder().setDescription("This isn't a modmail ticket silly, you cannot unassign this.").setColor(ticketEmbedColor)]
			});
		}
	}
}
