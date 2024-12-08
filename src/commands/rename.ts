import { ApplyOptions } from '@sapphire/decorators';
import { Args, Command } from '@sapphire/framework';
import { EmbedBuilder, GuildTextBasedChannel, Message } from 'discord.js';
import { ticketCategory, ticketEmbedColor } from '../lib/constants';
import { getOpenTicketByChannelFromCache } from '../lib/cache';
import { ticketType } from '../schema/tickets';
import { createErrorEmbed } from '../lib/utils';

@ApplyOptions<Command.Options>({
	name: 'rename',
	description: 'Rename a modmail thread.',
	preconditions: ['customerServiceOnly']
})
export class RenameCommand extends Command {
	public override async messageRun(message: Message, args: Args) {
		const messageChannel = message.channel as GuildTextBasedChannel;
		const newName = (await args.rest('string').catch(() => null))?.replace(' ', '-');
		const currName = messageChannel.name;

		if (!newName) {
			return message.reply({
				embeds: [createErrorEmbed('Please provide a valid name.')]
			});
		}

		if (newName.length > 108) {
			return message.reply({
				embeds: [createErrorEmbed('This name is too long.')]
			});
		}

		if (messageChannel.parentId !== ticketCategory) {
			return message.reply({
				embeds: [createErrorEmbed("This command can't be run here, this isn't a valid modmail channel.")]
			});
		}

		const openTicket = (await getOpenTicketByChannelFromCache(messageChannel.id)) as ticketType;
		if (!openTicket) {
			return message.reply({
				embeds: [createErrorEmbed("This command can't be run here, this isn't a valid modmail channel.")]
			});
		}

		await messageChannel.setName(newName, 'User Requested');
		await message.delete();

		return messageChannel.send({
			embeds: [
				new EmbedBuilder()
					.setDescription(`<@${message.author.id}> has renamed the channel from **${currName}** to **${newName}**.`)
					.setColor(ticketEmbedColor)
			]
		});
	}
}
