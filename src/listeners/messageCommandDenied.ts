import type { Events, MessageCommandDeniedPayload } from '@sapphire/framework';
import { Listener, type UserError } from '@sapphire/framework';
import { EmbedBuilder } from 'discord.js';
import { ticketEmbedColor } from '../lib/constants';

export class UserEvent extends Listener<typeof Events.MessageCommandDenied> {
	public override async run({ context, message: content }: UserError, { message }: MessageCommandDeniedPayload) {
		if (Reflect.get(Object(context), 'silent')) return;

		return message.reply({
			embeds: [new EmbedBuilder().setDescription(content).setColor(ticketEmbedColor)],
			allowedMentions: { users: [message.author.id], roles: [] }
		});
	}
}
