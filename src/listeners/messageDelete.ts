import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener } from '@sapphire/framework';
import { EmbedBuilder, Message, TextChannel } from 'discord.js';
import { ticketEmbedColor } from '../lib/constants';

@ApplyOptions<Listener.Options>({
	event: Events.MessageDelete
})
export class messageDeleteEvent extends Listener {
	public override async run(message: Message) {
		if (message.author.id === this.container.client.id) return;

		if (!message.guild) {
			const openTicket = await this.container.prisma.ticketMessage.findUnique({
				where: { clientSideMsg: message.id },
				include: { ticket: true }
			});

			if (openTicket) {
				const modmailChannel = (await this.container.client.channels.fetch(openTicket.ticket.channelId!)) as TextChannel;
				const supportMsg = await modmailChannel.messages.fetch(openTicket.supportSideMsg);

				if (!supportMsg) return;

				return supportMsg.edit({
					embeds: [
						new EmbedBuilder()
							.setColor(ticketEmbedColor)
							.setDescription(message.content ? message.content : 'No content provided.')
							.setAuthor({
								name: `${message.author.globalName} (@${message.author.username})`,
								iconURL: message.author.avatarURL()!
							})
							.setTimestamp()
							.setFooter({ text: 'Deleted by User' })
					]
				});
			} else {
				return;
			}
		}

		return;
	}
}
