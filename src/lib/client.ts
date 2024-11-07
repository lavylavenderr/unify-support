import { LogLevel, SapphireClient, container } from '@sapphire/framework';
import { getRootData } from '@sapphire/pieces';
import { GatewayIntentBits, Partials } from 'discord.js';
import { PrismaClient } from '@prisma/client';
import { join } from 'path';

import "@sapphire/plugin-api/register"
import '@kaname-png/plugin-subcommands-advanced/register';

export class AustrianBot extends SapphireClient {
	private rootData = getRootData();

	public constructor() {
		super({
			caseInsensitiveCommands: true,
			logger: {
				level: LogLevel.Debug
			},
			shards: 'auto',
			defaultPrefix: '.',
			api: {
				automaticallyConnect: true,
				prefix: '',
				origin: '*',
				listenOptions: {
					port: Number(process.env.PORT || 8010)
				},
			},
			intents: [
				GatewayIntentBits.DirectMessageReactions,
				GatewayIntentBits.DirectMessages,
				GatewayIntentBits.GuildModeration,
				GatewayIntentBits.GuildEmojisAndStickers,
				GatewayIntentBits.GuildMembers,
				GatewayIntentBits.GuildMessageReactions,
				GatewayIntentBits.GuildMessages,
				GatewayIntentBits.Guilds,
				GatewayIntentBits.GuildVoiceStates,
				GatewayIntentBits.MessageContent
			],
			partials: [Partials.Channel],
			loadMessageCommandListeners: true
		});

		this.stores.get('interaction-handlers').registerPath(join(this.rootData.root, 'interactions'));
		this.stores.get('listeners').registerPath(join(this.rootData.root, 'listeners'));
	}

	public override async login(token?: string) {
		container.prisma = new PrismaClient();
		return super.login(token);
	}

	public override async destroy() {
		return super.destroy();
	}
}

declare module '@sapphire/pieces' {
	interface Container {
		prisma: PrismaClient;
	}
}