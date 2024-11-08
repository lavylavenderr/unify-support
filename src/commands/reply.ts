import { ApplyOptions } from '@sapphire/decorators';
import { Args, Command } from '@sapphire/framework';
import { EmbedBuilder, GuildTextBasedChannel, Message } from 'discord.js';
import { ticketEmbedColor } from '../lib/constants';

@ApplyOptions<Command.Options>({
	name: 'reply',
	aliases: ['r'],
	description: 'Use this command to reply to a modmail ticket.'
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
			const usrMsg = await this.container.client.users.send(openTicket.author, {
				embeds: [
					new EmbedBuilder()
						.setColor(ticketEmbedColor)
						.setDescription(noPrefix ? noPrefix : '*No content*')
						.setAuthor({
							name: `${message.author.globalName} (@${message.author.username})`,
							iconURL: message.author.avatarURL()!
						})
						.setTimestamp()
						.setFooter({ text: 'Unify Support' })
				],
				files: Array.from(message.attachments.values())
			});

			const staffMsg = await messageChannel.send({
				embeds: [
					new EmbedBuilder()
						.setColor(ticketEmbedColor)
						.setDescription(noPrefix ? noPrefix : '*No content*')
						.setAuthor({
							name: `${message.author.globalName} (@${message.author.username})`,
							iconURL: message.author.avatarURL()!
						})
						.setTimestamp()
						.setFooter({ text: 'Unify Support' })
				],
				files: Array.from(message.attachments.values())
			});

			await this.container.prisma.ticketMessage.create({
				data: {
					ticketId: openTicket.id,
					supportSideMsg: staffMsg.id,
					clientSideMsg: usrMsg.id
				}
			})

			message.delete();
		}
	}
}
