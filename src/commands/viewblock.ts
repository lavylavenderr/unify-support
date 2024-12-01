import { ApplyOptions } from '@sapphire/decorators';
import { Args, Command } from '@sapphire/framework';
import { EmbedBuilder, Message, TextChannel } from 'discord.js';
import { ticketEmbedColor } from '../lib/constants';
import { blocklist } from '../schema/blocklist';
import { eq } from 'drizzle-orm';

@ApplyOptions<Command.Options>({
	name: 'viewblock',
	description: 'View a user on the blocklist.',
	aliases: ['vb']
})
export class ViewBlockCommand extends Command {
	public override async messageRun(message: Message, args: Args) {
		const msgChannel = message.channel as TextChannel;
		const mentionedUser = await args.pick('user').catch(() => null);

		await msgChannel.sendTyping();

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

		return message.reply({
			embeds: [
				new EmbedBuilder()
					.addFields(
						{
							name: 'Username',
							value: mentionedUser.username,
							inline: true
						},
						{
							name: 'Discord ID',
							value: mentionedUser.id,
							inline: true
						},
						{
							name: 'Account Created',
							value: `<t:${Math.floor(mentionedUser.createdTimestamp / 1000)}:f>`,
							inline: true
						},
						{
							name: 'Blacklist Reason',
							value: existingBlock.reason ?? 'No reason provided.',
							inline: false
						}
					)
					.setColor(ticketEmbedColor)
					.setThumbnail(mentionedUser.avatarURL()!)
					.setAuthor({
						name: message.author.globalName ? `${message.author.globalName} (@${message.author.username})` : message.author.username,
						iconURL: message.author.avatarURL()!
					})
			]
		});
	}
}
