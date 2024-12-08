import { ApplyOptions } from '@sapphire/decorators';
import { Args, Command } from '@sapphire/framework';
import { EmbedBuilder, Message } from 'discord.js';
import { mainGuild, ticketEmbedColor } from '../lib/constants';
import { snippets } from '../schema/snippets';
import { flushCache } from '../lib/cache';
import { eq } from 'drizzle-orm';
import { createErrorEmbed } from '../lib/utils';

@ApplyOptions<Command.Options>({
	name: 'snippets',
	aliases: ['snippet', 's'],
	description: 'Send or view snippets.',
	preconditions: ['staffMemberOnly']
})
export class SnippetCommand extends Command {
	public override async messageRun(message: Message, args: Args) {
		const action = args.finished ? null : await args.pick('string');
		const snippetName = args.finished ? null : await args.pick('string');
		const content = args.finished ? null : await args.rest('string');

		if (!action) {
			const allSnippets = await this.container.db.select().from(snippets);
			return message.reply({
				embeds: [
					new EmbedBuilder()
						.setTitle('Snippets')
						.setColor(ticketEmbedColor)
						.setDescription(
							allSnippets.length > 0
								? allSnippets.map((snippet, index) => `${index + 1}. ${snippet.identifier}`).join('\n')
								: 'No snippets exist as of right now.'
						)
				]
			});
		}

		const allSnippets = await this.container.db.select().from(snippets);
		const searchSnippet = (identifier: string) => allSnippets.find((x) => x.identifier === identifier);

		if (action === 'view' && snippetName) {
			const requestedSnippet = searchSnippet(snippetName);

			if (!requestedSnippet) {
				return message.reply({
					embeds: [createErrorEmbed('Sorry, that snippet does not exist.')]
				});
			}

			return message.reply({
				embeds: [new EmbedBuilder().setTitle(`Snippet: ${snippetName}`).setDescription(requestedSnippet.content).setColor(ticketEmbedColor)]
			});
		}

		const guildMember = await (await this.container.client.guilds.fetch(mainGuild)).members.fetch(message.author.id);
		const roleIds = ['802870322109480991', '873145273415794708', '1271081315357294593', '1289956449040076852'];
		if (!guildMember.roles.cache.some((role) => roleIds.includes(role.id))) {
			return message.reply({
				embeds: [createErrorEmbed('Sorry, only executives can manage snippets.')]
			});
		}

		// Validate snippet name for action
		if (['add', 'edit', 'delete'].includes(action)) {
			if (!snippetName) return message.reply('Sorry! You need to provide a snippet name for the ${action} action.');
			if (['edit', 'add', 'delete'].includes(snippetName)) return message.reply('Sorry! You cannot use that name for a snippet.');

			if (action === 'add' && !content) return message.reply('Sorry! You need to provide the content for the snippet.');
			if (action === 'edit' && !content) return message.reply('Sorry! You need to provide the new content for the snippet.');
		}

		switch (action) {
			case 'add': {
				await this.container.db.insert(snippets).values({ identifier: snippetName!, content: content! });

				flushCache();
				return message.reply({
					embeds: [
						new EmbedBuilder()
							.setDescription(`The snippet named **${snippetName}** has been created as requested.`)
							.setColor(ticketEmbedColor)
					]
				});
			}

			case 'edit': {
				const requestedSnippet = searchSnippet(snippetName!);

				if (!requestedSnippet) {
					return message.reply({
						embeds: [createErrorEmbed('Sorry, that snippet does not exist.')]
					});
				}

				await this.container.db.update(snippets).set({ content: content! }).where(eq(snippets.identifier, snippetName!));
				flushCache();
				return message.reply({
					embeds: [
						new EmbedBuilder()
							.setDescription(`The snippet named **${snippetName}** has been updated as requested.`)
							.setColor(ticketEmbedColor)
					]
				});
			}

			case 'delete': {
				const requestedSnippet = searchSnippet(snippetName!);

				if (!requestedSnippet) {
					return message.reply({
						embeds: [createErrorEmbed('Sorry, that snippet does not exist.')]
					});
				}

				await this.container.db.delete(snippets).where(eq(snippets.identifier, snippetName!));

				flushCache();
				return message.reply({
					embeds: [
						new EmbedBuilder()
							.setDescription(`The snippet named **${snippetName}** has been deleted as requested.`)
							.setColor(ticketEmbedColor)
					]
				});
			}

			default:
				return message.reply({
					embeds: [createErrorEmbed('Invalid action. Please use one of the following: `view`, `add`, `edit`, `delete`.')]
				});
		}
	}
}
