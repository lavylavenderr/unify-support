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
		return guildMember.roles.cache.has('806613323566809118')
			? this.ok()
			: this.error({ message: 'Sorry, you must be a staff member to run this command.' });
	}
}

declare module '@sapphire/framework' {
    interface Preconditions {
        staffMemberOnly: never
    }
}