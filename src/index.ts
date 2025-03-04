import RedisCache from "util/redis";
import { drizzle } from "drizzle-orm/node-postgres";

export const dragonfly = new RedisCache(Bun.env.DRAGONFLY_URL);
export const db = drizzle(Bun.env.DATABASE_URL);
