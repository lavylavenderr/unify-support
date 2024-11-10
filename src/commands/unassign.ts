import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { EmbedBuilder, Message, TextChannel } from 'discord.js';
import { ticketCategory, ticketEmbedColor } from '../lib/constants';

@ApplyOptions<Command.Options>({
	name: 'unassign',
	description: 'Unassign a ticket from someone.',
	preconditions: ['executiveOnly']
})
export class UnassignCommand extends Command {
	public override async messageRun(message: Message) {
		const messageChannel = message.channel as TextChannel;

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
				if (openTicket.claimedBy) {
					await this.container.prisma.ticket.update({
						where: { id: openTicket.id },
						data: { claimedBy: null }
					});

					messageChannel.permissionOverwrites.delete(openTicket.claimedBy);
					messageChannel.permissionOverwrites.create(message.guildId!, { SendMessages: true });

					return message.reply({
						embeds: [
							new EmbedBuilder()
								.setDescription('Okay, this ticket has been unassigned from <@' + openTicket.claimedBy + '> as requested.')
								.setColor(ticketEmbedColor)
						]
					});
				} else {
					return message.reply({
						embeds: [
							new EmbedBuilder()
								.setDescription('This ticket has not been claimed, therefore you cannot unassign it.')
								.setColor(ticketEmbedColor)
						]
					});
				}
			} else {
				return message.reply({
					embeds: [
						new EmbedBuilder()
							.setColor(ticketEmbedColor)
							.setDescription("This command can't be run here, this isn't a valid modmail channel.")
					]
				});
			}
		}

		return;
	}
}
