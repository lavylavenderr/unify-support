import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { EmbedBuilder, GuildTextBasedChannel } from 'discord.js';
import { ticketEmbedColor, ticketCategoryId } from '../lib/constants';

@ApplyOptions<Command.Options>({
	name: 'unsubscribe',
	description: 'Unsubscribe to a ticket.',
	preconditions: ['GuildOnly']
})
export class SubscribeCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) => {
			builder.setName(this.name).setDescription(this.description);
		});
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const intChannel = interaction.channel! as GuildTextBasedChannel;

		if (intChannel.parent && intChannel.parent.id! === ticketCategoryId) {
			const openTicket = await this.container.prisma.ticket.findFirst({
				where: {
					closed: false,
					channelId: intChannel.id
				}
			});

			if (openTicket && openTicket.subscribed.includes(interaction.user.id)) {
				const currSub = openTicket.subscribed.filter((x) => x !== interaction.user.id);

				await this.container.prisma.ticket.update({
					where: { id: openTicket.id },
					data: { subscribed: currSub }
				});

				return interaction.reply({
					embeds: [
						new EmbedBuilder().setColor(ticketEmbedColor).setDescription(`${interaction.user} unsubscribed from this ticket.`)
					]
				});
			} else {
				return interaction.reply({
					embeds: [new EmbedBuilder().setColor(ticketEmbedColor).setDescription("You're not subscribed to this ticket.")],
					ephemeral: true
				});
			}
		} else {
			return interaction.reply({
				embeds: [new EmbedBuilder().setColor(ticketEmbedColor).setDescription("This isn't a valid ticket, you cannot run this command.")],
				ephemeral: true
			});
		}
	}
}
