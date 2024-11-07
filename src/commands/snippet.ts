import { ApplyOptions } from '@sapphire/decorators';
import { Args, Command } from '@sapphire/framework';
import { EmbedBuilder, GuildTextBasedChannel, Message } from 'discord.js';
import { ticketEmbedColor } from '../lib/constants';

@ApplyOptions<Command.Options>({
	name: 'snippets',
	aliases: ['snippet', 's'],
	description: 'Send or view snippets.'
})
export class SnippetCommand extends Command {
	public override async messageRun(message: Message, args: Args) {
		const sendOrAction = args.finished ? null : await args.pick('string');
		const secondArg = args.finished ? null : await args.pick('string');
		const thirdArg = args.finished ? null : await args.rest('string');

		if (!sendOrAction) {
			const allSnippets = await this.container.prisma.snippet.findMany();

			return message.reply({
				embeds: [
					new EmbedBuilder()
						.setTitle('Snippets')
						.setColor(ticketEmbedColor)
						.setDescription(
							allSnippets
								.map((snippet, index) => {
									return `${index + 1}. ${snippet.identifier}`;
								})
								.join('\n') || 'No snippets exist as of right now.'
						)
				]
			});
		} else {
			const allSnippets = await this.container.prisma.snippet.findMany();

			if (allSnippets.find((x) => x.identifier === sendOrAction)) {
				const snippet = allSnippets.find((x) => x.identifier === sendOrAction)!;
				const messageChannel = message.channel as GuildTextBasedChannel;
				const openTicket = await this.container.prisma.ticket.findFirst({
					where: {
						closed: false,
						channelId: messageChannel.id
					}
				});

				if (openTicket) {
					await this.container.client.users.send(openTicket.author, {
						embeds: [
							new EmbedBuilder()
								.setColor(ticketEmbedColor)
								.setDescription(snippet.content)
								.setAuthor({
									name: `${message.author.globalName} (@${message.author.username})`,
									iconURL: message.author.avatarURL()!
								})
								.setTimestamp()
								.setFooter({ text: 'Unify Support' })
						]
					});

					messageChannel.send({
						embeds: [
							new EmbedBuilder()
								.setColor(ticketEmbedColor)
								.setDescription(snippet.content)
								.setAuthor({
									name: `${message.author.globalName} (@${message.author.username})`,
									iconURL: message.author.avatarURL()!
								})
								.setTimestamp()
								.setFooter({ text: 'Unify Support' })
						]
					});

					message.delete();
				} else {
					message.reply({
						embeds: [
							new EmbedBuilder().setColor(ticketEmbedColor).setDescription('You cannot run that as this is not a valid modmail ticket.')
						]
					});
				}
			} else {
				if (sendOrAction === 'view') {
					if (!secondArg)
						return message.reply({
							embeds: [
								new EmbedBuilder()
									.setDescription('Sorry! In order to view a snippet, you need to actually provide the name of it.')
									.setColor(ticketEmbedColor)
							]
						});

					const requestedSnippet = allSnippets.find((x) => x.identifier === secondArg);
					if (!requestedSnippet)
						return message.reply({
							embeds: [new EmbedBuilder().setDescription('Sorry, that snippet does not exist.').setColor(ticketEmbedColor)]
						});

					return message.reply({
						embeds: [
							new EmbedBuilder().setTitle(`Snippet: ${secondArg}`).setDescription(requestedSnippet.content).setColor(ticketEmbedColor)
						]
					});
				} else if (sendOrAction === 'add') {
					if (!secondArg)
						return message.reply({
							embeds: [
								new EmbedBuilder()
									.setDescription('Sorry! In order to add a snippet, you need to actually provide the name of it.')
									.setColor(ticketEmbedColor)
							]
						});

					if (!thirdArg)
						return message.reply({
							embeds: [
								new EmbedBuilder()
									.setDescription('Sorry! In order to add a snippet, you need to actually provide the content for it.')
									.setColor(ticketEmbedColor)
							]
						});

					await this.container.prisma.snippet.create({
						data: {
							identifier: secondArg,
							content: thirdArg
						}
					});

					return message.reply({
						embeds: [
							new EmbedBuilder()
								.setDescription(`The snippet named **${secondArg}** has been created as requested.`)
								.setColor(ticketEmbedColor)
						]
					});
				} else if (sendOrAction === 'delete') {
					if (!secondArg)
						return message.reply({
							embeds: [
								new EmbedBuilder()
									.setDescription('Sorry! In order to delete a snippet, you need to actually provide the name of it.')
									.setColor(ticketEmbedColor)
							]
						});

					await this.container.prisma.snippet.delete({
						where: { identifier: secondArg }
					});

					return message.reply({
						embeds: [
							new EmbedBuilder()
								.setDescription(`The snippet named **${secondArg}** has been deleted as requested.`)
								.setColor(ticketEmbedColor)
						]
					});
				}
			}

			return;
		}
	}
}