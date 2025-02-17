import { ticketCategory, ticketEmbedColor } from './../lib/constants';
import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, GuildTextBasedChannel, Message } from 'discord.js';
import discordTranscripts from 'discord-html-transcripts';
import { s3Client } from '../lib/space';
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { flushCache, getOpenTicketByChannelFromCache } from '../lib/cache';
import { ticketType, tickets } from '../schema/tickets';
import { eq } from 'drizzle-orm';
import { createErrorEmbed } from '../lib/utils';

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
			const openTicket = (await getOpenTicketByChannelFromCache(messageChannel.id)) as ticketType;

			if (openTicket) {
				const confirmbutton = new ButtonBuilder().setCustomId('confirmTicketClose').setLabel('Confirm').setStyle(ButtonStyle.Danger);
				const cancelbutton = new ButtonBuilder().setCustomId('cancelTicketClose').setLabel('Cancel').setStyle(ButtonStyle.Secondary);

				const collectorFilter = (i: any) => i.user.id === message.author.id;
				const confirmMsg = await message.reply({
					embeds: [new EmbedBuilder().setColor(ticketEmbedColor).setDescription('*Are you sure you want to close this ticket?*')],
					components: [new ActionRowBuilder<ButtonBuilder>().addComponents(confirmbutton, cancelbutton)]
				});

				try {
					const interaction = await confirmMsg.awaitMessageComponent({
						filter: collectorFilter,
						time: 30000
					});

					if (interaction.customId == 'confirmTicketClose') {
						const user = await this.container.client.users.cache.get(openTicket.authorId);

						const ticketOpener = await this.container.client.users.fetch(openTicket.authorId)!;
						const attachment = await discordTranscripts.createTranscript(message.channel!, {
							filename: `${openTicket.channelId}.html`,
							saveImages: true,
							poweredBy: false
						});
						const attachmentBuffer = Buffer.from(await attachment.attachment.toString());

						await s3Client.send(
							new PutObjectCommand({
								Bucket: 'foxxymaple',
								Key: `${openTicket.channelId}.html`,
								Body: attachmentBuffer,
								ACL: 'public-read',
								ContentType: 'text/html; charset=utf-8'
							}),
							function (_err, _data) {}
						);

						// Let the Space index the new transcript
						await new Promise((resolve) => setTimeout(resolve, 3000));

						const transcript = await s3Client
							.send(
								new GetObjectCommand({
									Bucket: 'foxxymaple',
									Key: `unify/${openTicket.channelId}.html`
								})
							)
							.catch(() => null);

						const transcriptChannel = (await this.container.client.channels.cache.get('902863701953101854')!) as GuildTextBasedChannel;
						const transcriptEmbed = new EmbedBuilder()
							.setColor(ticketEmbedColor)
							.addFields(
								{
									name: 'Ticket ID',
									value: `#${openTicket.id}`,
									inline: true
								},
								{
									name: 'Ticket Opener',
									value: `<@${openTicket.authorId}>`,
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
							});

						await message.channel!.delete();

						user
							?.send({
								embeds: [
									new EmbedBuilder()
										.setColor(ticketEmbedColor)
										.setDescription(
											`Thank you for contacting us, and don't hesitate to open a new ticket if you require further support. If you wish to request your transcript, please open another ticket and reference ticket **#${openTicket.id}** so that they may locate it.`
										)
								]
							})
							.catch(() => {
								this.container.logger.error('Unable to send ticket close notification to: ' + user.id);
							});

						await transcriptChannel.send({
							embeds: [transcriptEmbed],
							components: [
								new ActionRowBuilder<ButtonBuilder>().addComponents(
									transcript === null
										? new ButtonBuilder()
												.setLabel('Unable to Save Transcript')
												.setEmoji('⚠')
												.setStyle(ButtonStyle.Secondary)
												.setDisabled(true)
												.setCustomId('button')
										: new ButtonBuilder()
												.setLabel('Transcript')
												.setEmoji('🔗')
												.setStyle(ButtonStyle.Link)
												.setURL(`https://storage.lavylavender.com/unify/${openTicket.channelId}.html`)
								)
							]
						});

						await this.container.db.update(tickets).set({ closed: true }).where(eq(tickets.id, openTicket.id));
						flushCache(openTicket.authorId);
					} else {
						message.delete();
						confirmMsg.delete();
					}
				} catch (e) {
					return confirmMsg.edit({
						embeds: [createErrorEmbed('Interaction timed out.')],
						components: []
					});
				}
			} else {
				return message.reply({
					embeds: [createErrorEmbed("This command can't be run here, this isn't a valid modmail channel.")]
				});
			}
		}

		return;
	}
}
