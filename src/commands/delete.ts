import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { EmbedBuilder, Message, TextChannel } from 'discord.js';
import { ticketCategory, ticketEmbedColor } from '../lib/constants';

@ApplyOptions<Command.Options>({
	name: 'delete',
	description: 'Delete a message sent by a staff member.'
})
export class DeleteCommand extends Command {
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
				if (!message.reference)
					return message.reply({
						embeds: [new EmbedBuilder().setDescription('Sorry, you must reply to a message to delete.').setColor(ticketEmbedColor)]
					});

				const msgRecord = await this.container.prisma.ticketMessage.findUnique({
					where: { supportSideMsg: message.reference.messageId }
				});
				if (!msgRecord)
					return message.reply({
						embeds: [new EmbedBuilder().setDescription('Sorry, I did not find that message in my database.').setColor(ticketEmbedColor)]
					});

				const clientDms = (await this.container.client.channels.fetch(openTicket.dmId!)) as TextChannel;
				const clientMsg = await clientDms.messages.fetch(msgRecord.clientSideMsg)!;
				const supportMsg = await message.channel.messages.fetch(msgRecord.supportSideMsg ?? '1');

				if (clientMsg.author.id !== this.container.client.user!.id)
					return message.reply({
						embeds: [new EmbedBuilder().setDescription('You cannot delete a message sent by a user.').setColor(ticketEmbedColor)]
					});

				if (!supportMsg)
					return message.reply({
						embeds: [
							new EmbedBuilder()
								.setDescription('I was unable to find the corresponding message in this channel.')
								.setColor(ticketEmbedColor)
						]
					});

				(await clientMsg).delete();
				(await supportMsg).delete();
				(await message).delete();
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
