import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener } from '@sapphire/framework';
import { EmbedBuilder, GuildMember, TextChannel } from 'discord.js';
import { getOpenTicketByUserFromCache } from '../lib/cache';
import { tickets, ticketType } from '../schema/tickets';
import { eq } from 'drizzle-orm';

@ApplyOptions<Listener.Options>({
	event: Events.GuildMemberRemove
})
export class GuildMemberRemoveEvent extends Listener {
	public override async run(member: GuildMember) {
		const openTicket = (await getOpenTicketByUserFromCache(member.id)) as ticketType;
		if (!openTicket) return;

		if (!openTicket.channelId) {
			this.container.logger.error(`No channelId found for ticket associated with user ${member.id}`);
			return;
		}

		let modmailChannel: TextChannel | null = null;

		try {
			modmailChannel = (await this.container.client.channels.fetch(openTicket.channelId)) as TextChannel;
		} catch (err) {
			// If this errors out, assume the channel was manually deleted
			// Set ticket as closed if so
			await this.container.db.update(tickets).set({ closed: true }).where(eq(tickets.id, openTicket.id));
			return;
		}

		if (!modmailChannel) {
			return;
		}

		try {
			await modmailChannel.send({
				embeds: [
					new EmbedBuilder()
						.setColor('Red')
						.setDescription('User has left the guild, meaning your messages will not be received. Please close this ticket.')
				]
			});
		} catch (error) {
            // no fallback, idrc they'll find out one way or another
			return;
		}
	}
}
