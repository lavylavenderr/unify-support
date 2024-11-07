import type { ChatInputCommandDeniedPayload, Events } from '@sapphire/framework';
import { Listener, UserError } from '@sapphire/framework';
import { Colors, EmbedBuilder } from 'discord.js';

export class UserEvent extends Listener<typeof Events.ChatInputCommandDenied> {
	public override async run({ context, message: content }: UserError, { interaction }: ChatInputCommandDeniedPayload) {
		if (Reflect.get(Object(context), 'silent')) return;

		if (interaction.deferred || interaction.replied) {
			return interaction.editReply({
				embeds: [new EmbedBuilder().setColor(Colors.Red).setDescription(content)],
				components: [],
				attachments: [],
				allowedMentions: { users: [interaction.user.id], roles: [] }
			});
		}

		return interaction.reply({
			embeds: [new EmbedBuilder().setColor(Colors.Red).setDescription(content)],
			components: [],
			allowedMentions: { users: [interaction.user.id], roles: [] },
			ephemeral: true
		});
	}
}
