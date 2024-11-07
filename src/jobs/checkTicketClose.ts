import cron from 'node-cron';
import { cronitor } from '../lib/cronitor';
import { container } from '@sapphire/framework';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, GuildTextBasedChannel, TextChannel } from 'discord.js';
import discordTranscripts from 'discord-html-transcripts';
import { s3Client } from '../lib/space';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { ticketEmbedColor } from '../lib/constants';

cronitor.wraps(cron);

cronitor.schedule('UnifyCheckTicketClose', '* * * * *', async () => {
	const openTickets = await container.prisma.ticket.findMany({
		where: {
			closed: false,
			scheduledCloseTime: {
				lte: new Date()
			}
		}
	});

	for (const ticket of openTickets) {
		const user = await container.client.users.fetch(ticket.author);
		const ticketOpener = await container.client.users.fetch(ticket.author)!;
		const ticketChannel = (await container.client.channels.fetch(ticket.channelId)!) as TextChannel;
		const transcriptChannel = (await container.client.channels.cache.get('902863701953101854')) as GuildTextBasedChannel;

		const attachment = await discordTranscripts.createTranscript(ticketChannel, {
			filename: `transcript-${ticket.id}.html`,
			saveImages: true,
			poweredBy: false
		});
		const attachmentBuffer = Buffer.from(await attachment.attachment.toString());

		await s3Client.send(
			new PutObjectCommand({
				Bucket: 'foxxymaple',
				Key: `unify/transcript-${ticket.id}.html`,
				Body: attachmentBuffer,
				ACL: 'public-read',
				ContentType: 'text/html; charset=utf-8'
			})
		);

		user
			?.send({
				embeds: [
					new EmbedBuilder()
						.setColor(ticketEmbedColor)
						.setDescription(
							`Thank you for contacting us, and don't hesitate to open a new ticket if you require further support. If you wish to request your transcript, please open another ticket and reference ticket **#${ticket.id}** so that they may locate it.`
						)
				]
			})
			.catch(() => {
				container.logger.error('Unable to send ticket close notification');
			});

		transcriptChannel.send({
			embeds: [
				new EmbedBuilder()
					.setColor(ticketEmbedColor)
					.addFields(
						{
							name: 'Ticket ID',
							value: `#${ticket.id}`,
							inline: true
						},
						{
							name: 'Ticket Opener',
							value: `<@${ticket.author}>`,
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
						.setURL(`https://storage.lavylavender.com/unify/transcript-${ticket.id}.html`)
				)
			]
		});

		ticketChannel.delete();
		await container.prisma.ticket.update({
			where: { id: ticket.id },
			data: {
				closed: true
			}
		});
	}
});
