import { ApplyOptions } from '@sapphire/decorators';
import { Args, Command } from '@sapphire/framework';
import { ticketEmbedColor } from '../lib/constants';
import { EmbedBuilder, Message } from 'discord.js';
import { blocklist } from '../schema/blocklist';
import { eq } from 'drizzle-orm';
import { flushCache } from '../lib/cache';

@ApplyOptions<Command.Options>({
	name: 'unblock',
	description: 'Remove a user from the blocklist.',
	preconditions: ['executiveOnly']
})
export class BlockCommand extends Command {
	public override async messageRun(message: Message, args: Args) {
		const mentionedUser = await args.pick('user').catch(() => null);

		if (!mentionedUser) {
			return message.reply({
				embeds: [new EmbedBuilder().setDescription('Oops, you need to provide a valid user (mention or ID).').setColor(ticketEmbedColor)]
			});
		}

		const existingBlock = (await this.container.db.select().from(blocklist).where(eq(blocklist.userId, mentionedUser.id)))[0] ?? null;

		if (!existingBlock) {
			return message.reply({
				embeds: [new EmbedBuilder().setDescription('This user has not been blacklisted from support.').setColor('Red')]
			});
		}

		flushCache();
		await this.container.db.delete(blocklist).where(eq(blocklist.userId, mentionedUser.id));

		return message.reply({
			embeds: [
				new EmbedBuilder()
					.setColor('Green')
					.setDescription(`Alright, **${mentionedUser.username}** has been unblocked from the modmail system as requested.`)
			]
		});
	}
}
