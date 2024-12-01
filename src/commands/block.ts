import { ApplyOptions } from '@sapphire/decorators';
import { Args, Command } from '@sapphire/framework';
import { EmbedBuilder, Message } from 'discord.js';
import { ticketEmbedColor } from '../lib/constants';
import { blocklist } from '../schema/blocklist';
import { eq } from 'drizzle-orm';
import { flushCache } from '../lib/cache';

@ApplyOptions<Command.Options>({
	name: 'block',
	description: 'Block a user from being able to open support tickets.',
	preconditions: ['executiveOnly']
})
export class BlockCommand extends Command {
	public override async messageRun(message: Message, args: Args) {
		const mentionedUser = await args.pick('user').catch(() => null);
		const blockReason = await args.pick('string').catch(() => null);

		if (!mentionedUser) {
			return message.reply({
				embeds: [
					new EmbedBuilder()
						.setDescription('Oops, you need to provide a valid user (mention or ID).')
						.setColor(ticketEmbedColor)
				]
			});
		}

		const existingBlock = (await this.container.db.select().from(blocklist).where(eq(blocklist.userId, mentionedUser.id)))[0] ?? null;

		if (existingBlock) {
			return message.reply({
				embeds: [new EmbedBuilder().setDescription('This user has already been blacklisted from support.').setColor('Red')]
			});
		}

		flushCache();
		await this.container.db.insert(blocklist).values({
			userId: mentionedUser.id,
			reason: blockReason
		});

		return message.reply({
			embeds: [
				new EmbedBuilder()
					.setColor('Green')
					.setDescription(`Alright, **${mentionedUser.username}** has been blacklisted from the modmail system as requested.`)
			]
		});
	}
}
