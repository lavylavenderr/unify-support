import { ApplyOptions } from '@sapphire/decorators';
import { Args, Command } from '@sapphire/framework';
import { EmbedBuilder, Message } from 'discord.js';
import { commandList, ticketEmbedColor } from '../lib/constants';

@ApplyOptions<Command.Options>({
	name: 'help',
	description: 'The command that shows all commands available for use.',
	aliases: ['cmds', 'commands']
})
export class HelpCommand extends Command {
	public override async messageRun(message: Message, args: Args) {
		const requestedCmd = await args.pick('string').catch(() => null);

		if (!requestedCmd) {
			const helpEmbed = new EmbedBuilder()
				.setColor(ticketEmbedColor)
				.setAuthor({
					name: 'Modmail - Help',
					iconURL: this.container.client.user!.avatarURL()!
				})
				.setDescription(`**Commands**\n${commandList.map((cmd) => `\`.${cmd.name}\` - ${cmd.description}`).join('\n')}`)
				.setFooter({ text: 'Type ".help command" for more info on a specific command.' });

			return message.reply({
				embeds: [helpEmbed]
			});
		} else {
			const accCmd = commandList.find((x) => x.name === requestedCmd);

			if (!accCmd)
				return message.reply({
					embeds: [new EmbedBuilder().setDescription('Sorry, that command does not exist.').setColor(ticketEmbedColor)]
				});

			const commandOverview = new EmbedBuilder()
				.setTitle(`\`.${accCmd.name} ${accCmd.args ? accCmd.args.map((x) => `[${x.name}]`).join(' ') : ''}\``)
				.setColor(ticketEmbedColor)
				.setDescription(accCmd.detailedDescription ?? 'No detailed description was provided.');

			return message.reply({
				embeds: [commandOverview]
			});
		}
	}
}
