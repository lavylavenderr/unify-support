import RedisCache from "util/redis";
import { drizzle } from "drizzle-orm/node-postgres";
import { Client, GatewayIntentBits } from "discord.js";
import pino from "pino";

export const baseLogger = pino({
  level: "info",
});

export const dragonfly = new RedisCache(Bun.env.DRAGONFLY_URL);
export const db = drizzle(Bun.env.DATABASE_URL);
export const client =
  globalThis.hot_client ??
  new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildPresences,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMessages,
    ],
  });

client.removeAllListeners();
