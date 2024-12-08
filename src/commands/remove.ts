import { ApplyOptions } from '@sapphire/decorators';
import { Args, Command } from '@sapphire/framework';
import { EmbedBuilder, Message, TextChannel, User, Role } from 'discord.js';
import { ticketEmbedColor } from '../lib/constants';
import { getOpenTicketByChannelFromCache } from '../lib/cache';
import { ticketType } from '../schema/tickets';
import { createErrorEmbed } from '../lib/utils';

@ApplyOptions<Command.Options>({
	name: 'remove',
	description: 'Remove a user/role from a ticket'
})
export class RemoveCommand extends Command {
	public override async messageRun(message: Message, args: Args) {
		const messageChannel = message.channel as TextChannel;
		const userOrRole = await args.pick('user').catch(async () => await args.pick('role').catch(() => null));
		const openTicket = (await getOpenTicketByChannelFromCache(messageChannel.id)) as ticketType;

		if (!openTicket) {
			return message.reply({
				embeds: [createErrorEmbed('No open ticket found for this channel.')]
			});
		}

		if (!userOrRole) {
			return message.reply({
				embeds: [createErrorEmbed('Oops, you need to provide a valid user (mention or ID) or a valid role ID.')]
			});
		}

		try {
			if (userOrRole instanceof User || userOrRole instanceof Role) {
				await messageChannel.permissionOverwrites.create(userOrRole.id, { ViewChannel: false, SendMessages: false });

				return message.reply({
					embeds: [
						new EmbedBuilder()
							.setDescription(
								`I have removed <@${userOrRole instanceof User ? userOrRole.id : `&${userOrRole.id}`}>, from this ticket as requested.`
							)
							.setColor(ticketEmbedColor)
					]
				});
			}

			return message.reply({
				embeds: [createErrorEmbed('Invalid input. Please mention a valid user or provide a valid role ID.')]
			});
		} catch (error) {
			return message.reply({
				embeds: [createErrorEmbed('There was an error while trying to remove the user/role from this ticket.')]
			});
		}
	}
}
