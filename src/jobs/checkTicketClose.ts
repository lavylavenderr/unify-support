import cron from 'node-cron';
import { cronitor } from '../lib/cronitor';
import { container } from '@sapphire/framework';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, GuildTextBasedChannel, TextChannel } from 'discord.js';
import discordTranscripts from 'discord-html-transcripts';
import { s3Client } from '../lib/space';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { ticketEmbedColor } from '../lib/constants';
import { tickets } from '../schema/tickets';
import { and, eq, lte } from 'drizzle-orm';
import { flushCache } from '../lib/cache';

cronitor.wraps(cron);

cronitor.schedule('UnifyCheckTicketClose', '* * * * *', async () => {
	const openTickets = await container.db
		.select()
		.from(tickets)
		.where(and(lte(tickets.scheduledCloseTime, new Date()), eq(tickets.closed, false)));

	for (const ticket of openTickets) {
		const user = await container.client.users.fetch(ticket.authorId);
		const ticketOpener = await container.client.users.fetch(ticket.authorId)!;
		const ticketChannel = (await container.client.channels.fetch(ticket.channelId ?? '1')) as TextChannel;
		const transcriptChannel = (await container.client.channels.cache.get('902863701953101854')) as GuildTextBasedChannel;

		const attachment = await discordTranscripts.createTranscript(ticketChannel, {
			filename: `${ticket.channelId}.html`,
			saveImages: true,
			poweredBy: false
		});
		const attachmentBuffer = Buffer.from(await attachment.attachment.toString());
		let sendError: boolean = false;
		let transcriptError: boolean = false;

		try {
			await s3Client.send(
				new PutObjectCommand({
					Bucket: 'foxxymaple',
					Key: `unify/${ticket.channelId}.html`,
					Body: attachmentBuffer,
					ACL: 'public-read',
					ContentType: 'text/html; charset=utf-8'
				})
			);
		} catch {
			transcriptError = true;
		}

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
				sendError = true;
				container.logger.error('Unable to send ticket close notification');
			});

		const transcriptEmbed = new EmbedBuilder()
			.setColor(ticketEmbedColor)
			.addFields(
				{
					name: 'Ticket ID',
					value: `#${ticket.id}`,
					inline: true
				},
				{
					name: 'Ticket Opener',
					value: `<@${ticket.authorId}>`,
					inline: true
				},
				{
					name: 'Closed By',
					value: `<@${container.client.user!.id}>`,
					inline: false
				}
			)
			.setAuthor({
				name: `${ticketOpener.globalName} (@${ticketOpener.username})`,
				iconURL: ticketOpener.avatarURL()!
			});

		transcriptChannel.send({
			embeds: sendError
				? [
						transcriptEmbed,
						new EmbedBuilder()
							.setDescription(
								'⚠️ I was unable to inform the user that their ticket was closed, this may be because they were banned or left the server. **This is not an error with the bot!**'
							)
							.setColor(ticketEmbedColor)
					]
				: [transcriptEmbed],
			components: [
				new ActionRowBuilder<ButtonBuilder>().addComponents(
					!transcriptError
						? new ButtonBuilder()
								.setLabel('Transcript')
								.setEmoji('🔗')
								.setStyle(ButtonStyle.Link)
								.setURL(`https://storage.lavylavender.com/unify/${ticket.channelId}.html`)
						: new ButtonBuilder().setLabel('Unable to Save Transcript').setEmoji('⚠').setStyle(ButtonStyle.Secondary).setDisabled(true)
				)
			]
		});

		ticketChannel.delete();
		await container.db.update(tickets).set({ closed: true }).where(eq(tickets.id, ticket.id));
		flushCache();
	}
});
