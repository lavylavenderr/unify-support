import { AllFlowsPrecondition } from '@sapphire/framework';
import { CommandInteraction, ContextMenuCommandInteraction, Message, Snowflake } from 'discord.js';
import { mainGuild } from '../lib/constants';

export class StaffMemberOnlyPrecondition extends AllFlowsPrecondition {
	public override chatInputRun(interaction: CommandInteraction) {
		return this.doRoleCheck(interaction.user.id);
	}

	public override contextMenuRun(interaction: ContextMenuCommandInteraction) {
		return this.doRoleCheck(interaction.user.id);
	}

	public override messageRun(message: Message) {
		return this.doRoleCheck(message.author.id);
	}

	private async doRoleCheck(userId: Snowflake) {
		const guildMember = await (await this.container.client.guilds.fetch(mainGuild)).members.fetch(userId);
		const roleIds = ['802870322109480991', '873145273415794708', '1271081315357294593', '1289956449040076852'];

		return guildMember.roles.cache.some((role) => roleIds.includes(role.id))
			? this.ok()
			: this.error({ message: 'Sorry, only executive staff can run this.' });
	}
}

declare module '@sapphire/framework' {
	interface Preconditions {
		executiveOnly: never;
	}
}
