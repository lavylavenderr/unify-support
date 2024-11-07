import './lib/setup';
import { UnifyBot } from './lib/client';
import { env } from './lib/env';

const client = new UnifyBot();

(async () => {
	client
		.login(env.DISCORD_TOKEN)
		.then()
		.catch((err) => {
			client.logger.fatal(err);
			client.destroy();
			process.exit(1);
		});
})();