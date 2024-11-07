import { ApplyOptions } from '@sapphire/decorators';
import { Args, Command } from '@sapphire/framework';
import { EmbedBuilder, Message } from 'discord.js';
import { mainGuild, ticketEmbedColor } from '../lib/constants';

@ApplyOptions<Command.Options>({
	name: 'snippets',
	aliases: ['snippet', 's'],
	description: 'Send or view snippets.',
	preconditions: ['staffMemberOnly']
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
				if (!sendOrAction)
					return message.reply({
						embeds: [
							new EmbedBuilder()
								.setDescription('Sorry! In order to view a snippet, you need to actually provide the name of it.')
								.setColor(ticketEmbedColor)
						]
					});

				const requestedSnippet = allSnippets.find((x) => x.identifier === sendOrAction);
				if (!requestedSnippet)
					return message.reply({
						embeds: [new EmbedBuilder().setDescription('Sorry, that snippet does not exist.').setColor(ticketEmbedColor)]
					});

				return message.reply({
					embeds: [new EmbedBuilder().setTitle(`Snippet: ${sendOrAction}`).setDescription(requestedSnippet.content).setColor(ticketEmbedColor)]
				});
			} else {
				const guildMember = await (await this.container.client.guilds.fetch(mainGuild)).members.fetch(message.author.id);
				const roleIds = ['802870322109480991', '873145273415794708', '1271081315357294593', '1289956449040076852'];


				if (!guildMember.roles.cache.some((role) => roleIds.includes(role.id))) 
					return message.reply({
						embeds: [
							new EmbedBuilder()
								.setDescription('Sorry, only executives can manage snippets.')
								.setColor(ticketEmbedColor)
						]
					})
				

				if (sendOrAction === 'add') {
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

					if (secondArg === 'edit' || secondArg === 'add' || secondArg === 'delete')
						return message.reply({
							embeds: [new EmbedBuilder().setDescription('Sorry! You cannot use that name for a snippet.').setColor(ticketEmbedColor)]
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
				} else if (sendOrAction === 'edit') {
					if (!secondArg)
						return message.reply({
							embeds: [
								new EmbedBuilder()
									.setDescription('Sorry! In order to edit a snippet, you need to actually provide the name of it.')
									.setColor(ticketEmbedColor)
							]
						});

					if (!thirdArg)
						return message.reply({
							embeds: [
								new EmbedBuilder()
									.setDescription('Sorry! In order to edit a snippet, you need to actually provide the content for it.')
									.setColor(ticketEmbedColor)
							]
						});

					if (secondArg === 'edit' || secondArg === 'add' || secondArg === 'delete')
						return message.reply({
							embeds: [new EmbedBuilder().setDescription('Sorry! You cannot use that name for a snippet.').setColor(ticketEmbedColor)]
						});

					await this.container.prisma.snippet.update({
						where: { identifier: secondArg },
						data: {
							content: thirdArg
						}
					});

					return message.reply({
						embeds: [
							new EmbedBuilder()
								.setDescription(`The snippet named **${secondArg}** has been updated as requested.`)
								.setColor(ticketEmbedColor)
						]
					});
				}
			}

			return;
		}
	}
}
