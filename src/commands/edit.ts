import { ApplyOptions } from '@sapphire/decorators';
import { Args, Command } from '@sapphire/framework';
import { ticketCategory, ticketEmbedColor } from '../lib/constants';
import { EmbedBuilder, Message, TextChannel } from 'discord.js';

@ApplyOptions<Command.Options>({
	name: 'edit',
	description: 'Edit a message sent in a modmail thread.',
    preconditions: ['customerServiceOnly']
})
export class EditCommand extends Command {
	public override async messageRun(message: Message, args: Args) {
		const messageChannel = message.channel as TextChannel;
		const noPrefix = await args.rest('string').catch(() => null);

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
						embeds: [new EmbedBuilder().setDescription('Sorry, you must reply to a message to edit it.').setColor(ticketEmbedColor)]
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
						embeds: [new EmbedBuilder().setDescription('You cannot edit a message sent by a user.').setColor(ticketEmbedColor)]
					});

				if (!supportMsg)
					return message.reply({
						embeds: [
							new EmbedBuilder()
								.setDescription('I was unable to find the corresponding message in this channel.')
								.setColor(ticketEmbedColor)
						]
					});

				(await supportMsg).edit({
					embeds: [
						new EmbedBuilder()
							.setColor(ticketEmbedColor)
							.setDescription(noPrefix ? noPrefix : '*No content*')
							.setAuthor({
								name: `${message.author.globalName} (@${message.author.username})`,
								iconURL: message.author.avatarURL()!
							})
							.setTimestamp()
							.setFooter({ text: 'Unify Support (Edited)' })
					],
					files: Array.from(message.attachments.values())
				});
				(await clientMsg).edit({
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
