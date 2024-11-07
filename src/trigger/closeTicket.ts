import { task, wait } from '@trigger.dev/sdk/v3';
import { container } from "@sapphire/pieces";
import { ticketEmbedColor } from '../lib/constants';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, GuildTextBasedChannel, TextChannel } from 'discord.js';
import discordTranscripts from 'discord-html-transcripts';
import { s3Client } from '../lib/space';
import { PutObjectCommand } from '@aws-sdk/client-s3';

export const closeTicketTask = task({
	id: 'close-ticket',
	run: async (payload: { ticketId: number }) => {
		await wait.for({ seconds: 10 });

		const openTicket = await container.prisma.ticket.findUnique({
			where: {
				closed: false,
				id: payload.ticketId
			}
		});

		if (openTicket) {
			const user = await container.client.users.fetch(openTicket.author);

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
					container.logger.error('Unable to send ticket close notification');
				});

			const ticketOpener = await container.client.users.fetch(openTicket.author)!;
			const ticketChannel = (await container.client.channels.fetch(openTicket.channelId)!) as TextChannel;
			const attachment = await discordTranscripts.createTranscript(ticketChannel, {
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

			((await container.client.channels.cache.get('902863701953101854')!) as GuildTextBasedChannel).send({
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

			ticketChannel.delete();
			await container.prisma.ticket.update({
				where: { id: openTicket.id },
				data: {
					closed: true
				}
			});
		}
	}
});
