import { ApplyOptions } from '@sapphire/decorators';
import { Args, Command } from '@sapphire/framework';
import { EmbedBuilder, GuildTextBasedChannel, Message } from 'discord.js';
import { ticketEmbedColor } from '../lib/constants';

@ApplyOptions<Command.Options>({
	name: 'areply',
    aliases: ['anonreply'],
	description: 'Use this command to reply to a modmail ticket anonyomously.',
	preconditions: ['customerServiceOnly']
})
export class ReplyCommand extends Command {
	public override async messageRun(message: Message, args: Args) {
		const messageChannel = message.channel as GuildTextBasedChannel;
        const noPrefix = await args.rest('string').catch(() => null);
		const openTicket = await this.container.prisma.ticket.findFirst({
			where: {
				closed: false,
				channelId: messageChannel.id
			}
		});

		if (openTicket) {
			await this.container.client.users.send(openTicket.author, {
				embeds: [
					new EmbedBuilder()
						.setColor(ticketEmbedColor)
						.setDescription(noPrefix ? noPrefix : '*No content*')
						.setAuthor({
							name: `Unify Support (@unifyrbx)`,
							iconURL: this.container.client.user!.avatarURL()!
						})
						.setTimestamp()
						.setFooter({ text: 'Unify Support' })
				],
				files: Array.from(message.attachments.values())
			});

			messageChannel.send({
				embeds: [
					new EmbedBuilder()
						.setColor(ticketEmbedColor)
						.setDescription(noPrefix ? noPrefix : '*No content*')
						.setAuthor({
							name: `Unify Support (@unifyrbx)`,
							iconURL: this.container.client.user!.avatarURL()!
						})
						.setTimestamp()
						.setFooter({ text: 'Unify Support' })
				],
				files: Array.from(message.attachments.values())
			});

			message.delete();
		}
	}
}
