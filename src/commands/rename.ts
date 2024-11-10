import { ApplyOptions } from '@sapphire/decorators';
import { Args, Command } from '@sapphire/framework';
import { EmbedBuilder, GuildTextBasedChannel, Message } from 'discord.js';
import { ticketCategory, ticketEmbedColor } from '../lib/constants';
import { getOpenTicketByChannelFromCache } from '../lib/cache';
import { ticketType } from '../schema/tickets';

@ApplyOptions<Command.Options>({
	name: 'rename',
	description: 'Rename a modmail thread.',
	preconditions: ['customerServiceOnly']
})
export class RenameCommand extends Command {
	public override async messageRun(message: Message, args: Args) {
		const messageChannel = message.channel as GuildTextBasedChannel;
		const noPrefix = (await args.rest('string').catch(() => null))?.replace(' ', '-');
        const currName = messageChannel.name

		if (noPrefix) {
			if (noPrefix.length > 108)
				return message.reply({
					embeds: [new EmbedBuilder().setColor(ticketEmbedColor).setDescription('This name is too long.')]
				});

			if (messageChannel.parent && messageChannel.parentId === ticketCategory) {
				const openTicket = await getOpenTicketByChannelFromCache(messageChannel.id) as ticketType;

				if (openTicket) {
					await messageChannel.setName(noPrefix, 'User Requested');
					await message.delete();

					return messageChannel.send({
						embeds: [
							new EmbedBuilder()
								.setDescription(`<@${message.author.id}> has renamed the channel from **${currName}** to **${noPrefix}.**`)
								.setColor(ticketEmbedColor)
						]
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
		} else {
			return message.reply({
				embeds: [new EmbedBuilder().setColor(ticketEmbedColor).setDescription('Please provide a valid name.')]
			});
		}

        return;
	}
}
