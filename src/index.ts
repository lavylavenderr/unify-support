import './lib/setup';
import { AustrianBot } from './lib/client';
import { TextChannel } from 'discord.js';
import { env } from './lib/env';

const client = new AustrianBot();

import "./jobs"

(async () => {
	client
		.login(env.DISCORD_TOKEN)
		.then(() => {
			// cron.schedule('* * * * *', async function () {
			// 	rankWFAUsers()
			// 		.then()
			// 		.catch((err) => {
			// 			container.logger.error(err);
			// 		});
			// });
		})
		.catch((err) => {
			client.logger.fatal(err);
			client.destroy();
			process.exit(1);
		});
})();

process.on('uncaughtException', async function (err) {
	{
		console.log(err);
		const channel = client.channels.cache.get('1272976595199590502') as TextChannel;
		if (channel) channel.send(`\`\`\`${err.toString()}\`\`\``);
	}
});