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
		const roleIds = ['878175903895679027', '802909560393695232', '802871568878403594', '1289956449040076852'];

		return guildMember.roles.cache.some((role) => roleIds.includes(role.id))
			? this.ok()
			: this.error({ message: 'Sorry, you are not customer support staff, so you cannot run this.' });
	}
}

declare module '@sapphire/framework' {
	interface Preconditions {
		customerServiceOnly: never;
	}
}
