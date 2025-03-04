import RedisCache from "util/redis";
import { drizzle } from "drizzle-orm/node-postgres";
import { Client, GatewayIntentBits, Partials } from "discord.js";
import pino from "pino";
import events from "./events"; // Assuming you have a custom events module

export const baseLogger = pino({
  level: "debug",
});

export const dragonfly = new RedisCache(Bun.env.DRAGONFLY_URL);
export const db = drizzle(Bun.env.DATABASE_URL);
export const client =
  globalThis.hot_client ??
  new Client({
    intents: [
      GatewayIntentBits.DirectMessageReactions,
      GatewayIntentBits.DirectMessages,
      GatewayIntentBits.GuildModeration,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessageReactions,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildVoiceStates,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildPresences,
    ],
    partials: [Partials.Channel]
  });

client.removeAllListeners();

type ClientEvent = {
  type: keyof Client;
  event: string;
  fn: (...args: any[]) => void;
};

for (const event of events as ClientEvent[]) {
  (client[event.type] as any)(event.event, event.fn);
  baseLogger.debug(`Hooked event ${event.event}!`);
}

if (!globalThis.hot_client) client.login(Bun.env.DISCORD_TOKEN);
globalThis.hot_client = client;
