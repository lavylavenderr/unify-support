import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { EmbedBuilder, Message, TextChannel } from 'discord.js';
import { ticketCategory, ticketEmbedColor } from '../lib/constants';

@ApplyOptions<Command.Options>({
	name: 'claim',
	description: 'Claim a ticket.',
	preconditions: ['customerServiceOnly']
})
export class ClaimCommand extends Command {
	public override async messageRun(message: Message) {
		const messageChannel = message.channel as TextChannel;

		if (messageChannel.parent && messageChannel.parentId === ticketCategory) {
			const openTicket = await this.container.prisma.ticket.findFirst({
				where: {
					closed: false,
					channelId: messageChannel.id
				}
			});

			if (openTicket) {
				if (openTicket.claimedBy)
					return message.reply({
						embeds: [
							new EmbedBuilder()
								.setDescription('Oops, this ticket has already been claimed. If you wish to override this, inform management.')
								.setColor(ticketEmbedColor)
						]
					});

				messageChannel.permissionOverwrites.edit(message.author.id, { SendMessages: true, ViewChannel: true });
				messageChannel.permissionOverwrites.edit('878175903895679027', { SendMessages: false });
				messageChannel.permissionOverwrites.edit('1289956449040076852', { SendMessages: true, ViewChannel: true });
				messageChannel.permissionOverwrites.edit('802909560393695232', { ViewChannel: true, SendMessages: false });

				await this.container.prisma.ticket.update({
					where: { id: openTicket.id },
					data: { claimedBy: message.author.id }
				});

				return message.reply({
					embeds: [new EmbedBuilder().setColor(ticketEmbedColor).setDescription(`<@${message.author.id}> has claimed this ticket.`)]
				});
			} else {
				message.reply({
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
