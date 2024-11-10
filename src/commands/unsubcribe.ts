import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { EmbedBuilder, GuildTextBasedChannel, Message } from 'discord.js';
import { ticketEmbedColor, ticketCategory } from '../lib/constants';

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
			const openTicket = await this.container.prisma.ticket.findFirst({
				where: {
					closed: false,
					channelId: messageChannel.id
				},
					cacheStrategy: {
						ttl: 120,
						tags: ["findFirst_ticket"]
					}
			});

			if (openTicket) {
				let currSub = openTicket.subscribed;

				if (openTicket && openTicket.subscribed.includes(message.author.id)) {
					currSub = currSub.filter((x) => x !== message.author.id);

					await this.container.prisma.ticket.update({
						where: { id: openTicket.id },
						data: { subscribed: currSub }
					});

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
