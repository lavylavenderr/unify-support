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
								.setDescription('Oops, this ticket has already been claimed. If you wish to override this, inform a executive.')
								.setColor(ticketEmbedColor)
						]
					});

				messageChannel.permissionOverwrites.edit(message.author.id, { SendMessages: true, ViewChannel: true });
				messageChannel.permissionOverwrites.edit(message.guild!.id, { SendMessages: false });

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
