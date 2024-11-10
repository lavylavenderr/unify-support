import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { EmbedBuilder, GuildTextBasedChannel, Message } from 'discord.js';
import { ticketEmbedColor, ticketCategory } from '../lib/constants';
import { tickets, ticketType } from '../schema/tickets';
import { eq } from 'drizzle-orm';
import { flushCache, getOpenTicketByChannelFromCache } from '../lib/cache';

@ApplyOptions<Command.Options>({
	name: 'unsubscribe',
	aliases: ['unsub'],
	description: 'Unsubscribe to a ticket.',
	preconditions: ['customerServiceOnly']
})
export class SubscribeCommand extends Command {
	public override async messageRun(message: Message) {
		const messageChannel = message.channel as GuildTextBasedChannel;

		if (messageChannel.parent && messageChannel.parentId === ticketCategory) {
			const openTicket = (await getOpenTicketByChannelFromCache(messageChannel.id)) as ticketType;

			if (openTicket) {
				let currSub = openTicket.subscribed;

				if (openTicket && openTicket.subscribed.includes(message.author.id)) {
					currSub = currSub.filter((x) => x !== message.author.id);

					await this.container.db.update(tickets).set({ subscribed: currSub }).where(eq(tickets.id, openTicket.id));
					flushCache(`userTicket:${openTicket.channelId}`)

					return message.reply({
						embeds: [
							new EmbedBuilder()
								.setColor(ticketEmbedColor)
								.setDescription(`<@${message.author.id}> has been unsubscribed from this ticket.`)
						]
					});
				} else {
					return message.reply({
						embeds: [new EmbedBuilder().setColor(ticketEmbedColor).setDescription('You are not subscribed to this ticket.')]
					});
				}
			} else {
				return message.reply({
					embeds: [new EmbedBuilder().setColor(ticketEmbedColor).setDescription("This isn't a valid ticket, you cannot run this command.")]
				});
			}
		}

		return;
	}
}
