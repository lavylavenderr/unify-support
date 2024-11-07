import { ticketCategory, ticketEmbedColor } from './../lib/constants';
import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, GuildTextBasedChannel, Message } from 'discord.js';
import discordTranscripts from 'discord-html-transcripts';
import { s3Client } from '../lib/space';
import { PutObjectCommand } from '@aws-sdk/client-s3';

@ApplyOptions<Command.Options>({
	name: 'close',
	description: 'Close a modmail ticket.',
	aliases: ['c'],
	preconditions: ['customerServiceOnly']
})
export class CloseCommand extends Command {
	public override async messageRun(message: Message) {
		const messageChannel = message.channel as GuildTextBasedChannel;

		if (messageChannel.parent && messageChannel.parentId === ticketCategory) {
			const openTicket = await this.container.prisma.ticket.findFirst({
				where: {
					closed: false,
					channelId: messageChannel.id
				}
			});

			if (openTicket) {
				const confirmbutton = new ButtonBuilder().setCustomId('confirmTicketClose').setLabel('Confirm').setStyle(ButtonStyle.Danger);
				const cancelbutton = new ButtonBuilder().setCustomId('cancelTicketClose').setLabel('Cancel').setStyle(ButtonStyle.Secondary);

				const confirmMsg = await messageChannel.send({
					embeds: [new EmbedBuilder().setColor(ticketEmbedColor).setDescription('*Are you sure you want to close this ticket?*')],
					components: [new ActionRowBuilder<ButtonBuilder>().addComponents(confirmbutton, cancelbutton)]
				});
				const collectorFilter = (i: any) => i.user.id === message.author.id;

				try {
					const interaction = await confirmMsg.awaitMessageComponent({
						filter: collectorFilter,
						time: 30000
					});

					if (interaction.customId == 'confirmTicketClose') {
						const user = await this.container.client.users.cache.get(openTicket.author);

						user
							?.send({
								embeds: [
									new EmbedBuilder()
										.setColor(ticketEmbedColor)
										.setDescription(
											`Thank you for contacting us, and don't hesitate to open a new ticket if you require further support. If you wish to request your transcript, please open another ticket and reference **Ticket #${openTicket.id}** so that they may locate it.`
										)
								]
							})
							.catch(() => {
								this.container.logger.error('Unable to send ticket close notification');
							});

						const ticketOpener = await this.container.client.users.fetch(openTicket.author)!;
						const attachment = await discordTranscripts.createTranscript(message.channel!, {
							filename: `transcript-${openTicket.id}.html`,
							saveImages: true,
							footerText: 'Ticket ID ' + openTicket.id,
							poweredBy: false
						});
						const attachmentBuffer = Buffer.from(await attachment.attachment.toString());

						await s3Client.send(
							new PutObjectCommand({
								Bucket: 'foxxymaple',
								Key: `unify/transcript-${openTicket.id}.html`,
								Body: attachmentBuffer,
								ACL: 'public-read',
								ContentType: 'text/html; charset=utf-8'
							})
						);

						((await this.container.client.channels.cache.get('902863701953101854')!) as GuildTextBasedChannel).send({
							embeds: [
								new EmbedBuilder()
									.setColor(ticketEmbedColor)
									.addFields(
										{
											name: 'Ticket ID',
											value: `#${openTicket.id}`,
											inline: true
										},
										{
											name: 'Ticket Opener',
											value: `<@${openTicket.author}>`,
											inline: true
										},
										{
											name: 'Closed By',
											value: `<@${message.author.id}>`,
											inline: false
										}
									)
									.setAuthor({
										name: `${ticketOpener.globalName} (@${ticketOpener.username})`,
										iconURL: ticketOpener.avatarURL()!
									})
							],
							components: [
								new ActionRowBuilder<ButtonBuilder>().addComponents(
									new ButtonBuilder()
										.setLabel('Transcript')
										.setEmoji('🔗')
										.setStyle(ButtonStyle.Link)
										.setURL(`https://storage.lavylavender.com/unify/transcript-${openTicket.id}.html`)
								)
							]
						});

						message.channel!.delete();
						await this.container.prisma.ticket.update({
							where: { id: openTicket.id },
							data: {
								closed: true
							}
						});
					} else {
						message.delete();
						confirmMsg.delete();
					}
				} catch (e) {
					console.log(e);
					message.reply({
						embeds: [new EmbedBuilder().setColor(ticketEmbedColor).setDescription('*Timed out*')],
						components: []
					});
				}
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
	}
}
