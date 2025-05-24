import { ticketDepartments } from './../lib/constants';
import { ticketMessages, ticketType, tickets } from './../schema/tickets';
import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener } from '@sapphire/framework';
import {
	ActionRowBuilder,
	Colors,
	ComponentType,
	EmbedBuilder,
	GuildTextBasedChannel,
	Message,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder
} from 'discord.js';
import { ticketEmbedColor, mainGuild, ticketCategory, ticketDepartmentType } from '../lib/constants';
import { add } from 'date-fns';
import {
	flushCache,
	getOpenTicketByChannelFromCache,
	getOpenTicketByUserFromCache,
	getSnippetFromCache
} from '../lib/cache';
import { and, eq } from 'drizzle-orm';
import { snippetType } from '../schema/snippets';
import { getUserRoleInServer } from '../lib/utils';

@ApplyOptions<Listener.Options>({
	event: Events.MessageCreate
})
export class messageCreateEvent extends Listener {
	// @ts-expect-error
	public override async run(message: Message) {
		if (message.author.id === this.container.client.id) return;

		// If is a DM message
		if (!message.guild) {
			const openTicket = (await getOpenTicketByUserFromCache(message.author.id)) as ticketType;

			if (openTicket) {
				const ticketChannel = (await this.container.client.channels.cache.get(openTicket.channelId)) as GuildTextBasedChannel;

				if (ticketChannel) {
					if (openTicket.scheduledCloseTime)
						await this.container.db.update(tickets).set({ scheduledCloseTime: null }).where(eq(tickets.id, openTicket.id));

					try {
						const reply = await ticketChannel.send({
							embeds: [
								new EmbedBuilder()
									.setColor(ticketEmbedColor)
									.setDescription(message.content ? message.content : 'No content provided.')
									.setAuthor({
										name: message.author.globalName
											? `${message.author.globalName} (@${message.author.username})`
											: message.author.username,
										iconURL: message.author.avatarURL()!
									})
									.setFooter({ text: 'Message ID: ' + message.author.id })
									.setTimestamp()
							],
							files: Array.from(message.attachments.values()),
							...(openTicket!.subscribed.length > 0 && { content: openTicket!.subscribed.map((value) => `<@${value}>`).join(' ') })
						});

						await message.react('✅');
						await this.container.db
							.insert(ticketMessages)
							.values({ ticketId: openTicket.id, supportMsgId: reply.id, clientMsgId: message.id });
					} catch (e) {
						this.container.logger.error(e);
						message.reply({
							allowedMentions: { repliedUser: false },
							embeds: [
								new EmbedBuilder()
									.setColor(Colors.Red)
									.setDescription('Oh no, something went wrong, please report this to @FoxxyMaple.')
							]
						});
					}
				} else {
					await this.container.db.update(tickets).set({ closed: true }).where(eq(tickets.id, openTicket.id));
					flushCache();

					return message.reply({
						allowedMentions: { repliedUser: false },
						embeds: [
							new EmbedBuilder()
								.setColor(Colors.Red)
								.setDescription(
									'It would appear that a staff member has deleted your corresponding ticket channel, as a result, your ticket has been automatically closed.'
								)
						]
					});
				}
			} else {
				try {
					const deptPicker = new StringSelectMenuBuilder().setCustomId('deptpicker').setPlaceholder('Select a Department');

					for (const dept of ticketDepartments) {
						deptPicker.addOptions(
							new StringSelectMenuOptionBuilder().setLabel(dept.name).setDescription(dept.description).setValue(dept.name)
						);
					}

					const guild = await this.container.client.guilds.fetch(mainGuild)!;
					const guildMember = await guild.members.fetch(message.author.id)!;
					const collectorFilter = (i: any) => i.user.id === message.author.id;

					const response = await message.reply({
						allowedMentions: { repliedUser: false },
						components: [new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(deptPicker)],
						embeds: [
							new EmbedBuilder()
								.setColor(ticketEmbedColor)
								.setDescription(
									'Please only use my DMs to open a ticket. If you wish to do so, please select the appropiate department below. Do note that the first message sent will not be transmissted, so please wait to state your inquiry.'
								)
						]
					});

					response
						.awaitMessageComponent({ filter: collectorFilter, componentType: ComponentType.StringSelect, time: 20000 })
						.then(async (collected) => {
							const usrName = message.author.globalName ? message.author.globalName : message.author.username;
							const selectedCat = collected.values[0] as ticketDepartmentType;
							const categoryInfo = ticketDepartments.find((x) => x.name === selectedCat)!;

							const pastTickets = await this.container.db
								.select()
								.from(tickets)
								.where(and(eq(tickets.closed, true), eq(tickets.authorId, message.author.id)));

							guild.channels
								.create({
									name: categoryInfo.shortCode + '-' + usrName,
									topic: 'In order to reply to the user, please do .reply <message> in order to do so.',
									parent: ticketCategory
								})
								.then(async (c) => {
									await this.container.db.insert(tickets).values({
										channelId: c.id,
										authorId: message.author.id,
										category: categoryInfo.shortCode,
										dmId: message.channelId
									});

									flushCache();

									categoryInfo.allowedRoles.forEach(async (role) => {
										await c.permissionOverwrites.edit(role, { ViewChannel: true, SendMessages: true });
									});

									await c
										.send({
											content: categoryInfo.allowedRoles.map((role) => `<@&${role}>`).join(' '),
											embeds: [
												new EmbedBuilder()
													.setColor(ticketEmbedColor)
													.setDescription(
														`Their account was created <t:${Math.floor(message.author.createdTimestamp / 1000)}:R>, they joined the server ${guildMember.joinedTimestamp ? `<t:${Math.floor(guildMember.joinedTimestamp / 1000)}:R>` : 'at an unknown date'} and they have ${pastTickets.length === 0 ? 'not opened any past tickets.' : `opened **${pastTickets.length}** ticket(s) prior to this one.`}`
													)
													.addFields({
														name: 'Roles',
														value:
															guildMember.roles.cache
																.filter((role) => role.name !== '@everyone')
																.map((role) => role.name)
																.join(', ') || 'User has no roles.'
													})
													.setAuthor({
														name: message.author.globalName
															? `${message.author.globalName} (@${message.author.username})`
															: message.author.username,
														iconURL: message.author.avatarURL()!
													})
													.setFooter({ text: `User ID: ${message.author.id} • DM ID: ${message.channelId}` }),
												new EmbedBuilder()
													.setColor(ticketEmbedColor)
													.setDescription(
														pastTickets.length > 0
															? `This user has contacted us before, you can see all their tickets below.\n\n${pastTickets
																	.map(
																		(ticket) =>
																			`- Ticket **#${ticket.id}** - [Transcript](https://storage.lavylavender.com/unify/${ticket.channelId}.html)`
																	)
																	.join('\n')}`
															: 'This user has not opened any previous modmail tickets.'
													)
											]
										})
										.then(async (msg) => {
											await msg.pin();
										});

									await response.edit({
										embeds: [
											new EmbedBuilder()
												.setColor(ticketEmbedColor)
												.setDescription(
													'Your ticket has been created. Please make sure to describe your inquiry in full detail in order to provide the responding member with as much info as possible.'
												)
										],
										components: []
									});
								});
						})
						.catch(() => {
							response.edit({
								embeds: [
									new EmbedBuilder()
										.setColor(Colors.Red)
										.setDescription('Interaction has timed out, please send another message to toggle this again.')
								],
								components: []
							});
						});
				} catch (err) {
					this.container.logger.error(err);
					await message.reply({
						embeds: [new EmbedBuilder().setColor('Red').setDescription('An unknown error has occured, please inform an exeuctive.')]
					});
				}
			}
		} else {
			const openTicket = (await getOpenTicketByChannelFromCache(message.channel.id)) as ticketType;

			if (openTicket) {
				const splitAtPrefix = message.content.substring(1);
				const requestedSnippet = (await getSnippetFromCache(splitAtPrefix)) as snippetType;
				const messageChannel = message.channel as GuildTextBasedChannel;

				if (requestedSnippet) {
					try {
						const userRole = await getUserRoleInServer(message.author.id);
						const usrMsg = await this.container.client.users.send(openTicket.authorId, {
							embeds: [
								new EmbedBuilder()
									.setColor(ticketEmbedColor)
									.setDescription(requestedSnippet.content)
									.setAuthor({
										name: message.author.globalName
											? `${message.author.globalName} (@${message.author.username})`
											: message.author.username,
										iconURL: message.author.avatarURL()!
									})
									.setTimestamp()
									.setFooter({ text: userRole })
							]
						});

						const staffMsg = await messageChannel.send({
							embeds: [
								new EmbedBuilder()
									.setColor(ticketEmbedColor)
									.setDescription(requestedSnippet.content)
									.setAuthor({
										name: message.author.globalName
											? `${message.author.globalName} (@${message.author.username})`
											: message.author.username,
										iconURL: message.author.avatarURL()!
									})
									.setTimestamp()
									.setFooter({ text: userRole })
							]
						});

						await message.delete();
						await this.container.db
							.insert(ticketMessages)
							.values({ ticketId: openTicket.id, supportMsgId: staffMsg.id, clientMsgId: usrMsg.id });

						if (requestedSnippet.identifier === 'anythingelse' || requestedSnippet.identifier === 'inactive') {
							await this.container.db
								.update(tickets)
								.set({ scheduledCloseTime: add(new Date(), { hours: 6 }) })
								.where(eq(tickets.id, openTicket.id));
						}
					} catch {
						await message.reply({
							embeds: [
								new EmbedBuilder()
									.setColor(ticketEmbedColor)
									.setDescription(
										'Sorry, I encountered an error while replying to the ticket. The user may have left the server or there was an issue with sending the message.'
									)
							]
						});
					}
				}
			}
		}
	}
}
