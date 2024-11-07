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
import { ticketEmbedColor, mainGuild, ticketDepartments, ticketCategory } from '../lib/constants';

@ApplyOptions<Listener.Options>({
	event: Events.MessageCreate
})
export class messageCreateEvent extends Listener {
	// @ts-expect-error
	public override async run(message: Message) {
		if (message.author.id === this.container.client.id) return;

		// If is a DM message
		if (!message.guild) {
			const openTicket = await this.container.prisma.ticket.findFirst({
				where: {
					closed: false,
					author: message.author.id
				}
			});

			if (openTicket) {
				const ticketChannel = (await this.container.client.channels.cache.get(openTicket?.channelId ?? '1')) as GuildTextBasedChannel;

				if (ticketChannel) {
					ticketChannel
						.send({
							embeds: [
								new EmbedBuilder()
									.setColor(ticketEmbedColor)
									.setDescription(message.content ? message.content : 'No content provided.')
									.setAuthor({
										name: `${message.author.globalName} (@${message.author.username})`,
										iconURL: message.author.avatarURL()!
									})
							],
							files: Array.from(message.attachments.values()),
							...(openTicket!.subscribed.length > 0 && { content: openTicket!.subscribed.map((value) => `<@${value}>`).join(' ') })
						})
						.then(() => message.react('✅'))
						.catch((error) => {
							this.container.logger.error(error);
							message.reply({
								allowedMentions: { repliedUser: false },
								embeds: [
									new EmbedBuilder()
										.setColor(Colors.Red)
										.setDescription('Oh no, something went wrong, please report this to @FoxxyMaple.')
								]
							});
						});
				} else {
					await this.container.prisma.ticket.update({
						where: {
							id: openTicket.id
						},
						data: {
							closed: true
						}
					});

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
				const deptPicker = new StringSelectMenuBuilder().setCustomId('deptpicker').setPlaceholder('Select a Department');
				const guild = await this.container.client.guilds.fetch(mainGuild)!;

				for (const dept of ticketDepartments) {
					deptPicker.addOptions(
						new StringSelectMenuOptionBuilder().setLabel(dept.name).setDescription(dept.description).setValue(dept.name)
					);
				}

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
						let categoryName;
						let userName = message.author.globalName;

						const pastTickets = await this.container.prisma.ticket.findMany({
							where: { author: message.author.id }
						});

						switch (collected.values[0]) {
							case 'Liveries':
								categoryName = `liv-${message.author.globalName}`;
								break;
							case '3D Logos':
								categoryName = `log-${userName}`;
								break;
							case 'Uniform':
								categoryName = `uni-${userName}`;
								break;
							case 'Public Relations':
								categoryName = `pr-${userName}`;
								break;
							case 'Other':
								categoryName = `other-${userName}`;
								break;
						}

						guild.channels.create({ name: categoryName! }).then(async (c) => {
							c.setParent(ticketCategory);
							c.setTopic('In order to reply to the user, please do .reply <message> in order to do so.');

							await this.container.prisma.ticket.create({
								data: {
									channelId: c.id,
									author: message.author.id
								}
							});

							c.permissionOverwrites.edit('878175903895679027', { ViewChannel: true, SendMessages: true }); // Customer Service
							c.permissionOverwrites.edit('1289956449040076852', { ViewChannel: true, SendMessages: true }); // Department Head

							if (categoryName!.includes('pr') || categoryName!.includes('other')) {
								c.permissionOverwrites.edit('1303815721003913277', { ViewChannel: true, SendMessages: true });
							} else {
								c.permissionOverwrites.edit('802909560393695232', { ViewChannel: true, SendMessages: true });
							}

							response.edit({
								embeds: [
									new EmbedBuilder()
										.setColor(ticketEmbedColor)
										.setDescription(
											'Your ticket has been created. Please make sure to describe your inquiry in full detail in order to provide the responding member with as much info as possible.'
										)
								],
								components: []
							});

							c.send({
								embeds: [
									new EmbedBuilder()
										.setColor(ticketEmbedColor)
										.setDescription(
											`Their account was created <t:${Math.floor(message.author.createdTimestamp / 1000)}:R> and they have ${pastTickets.length === 0 ? 'not opened any past tickets.' : `opened **${pastTickets.length}** ticket(s) prior to this one.`}`
										)
										.setAuthor({
											name: `${message.author.globalName} (@${message.author.username})`,
											iconURL: message.author.avatarURL()!
										})
										.setFooter({ text: `User ID: ${message.author.id} • DM ID: ${message.channelId}` })
								]
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
			}
		}
	}
}
