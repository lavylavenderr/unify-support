import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
    DISCORD_TOKEN: z.string(),
    DATABASE_URL: z.string(),
    DIGITALOCEAN_SPACEKEY: z.string(),
    DIGITALOCEAN_SPACEKEY_PRIV: z.string(),
    CRONITOR_KEY: z.string()
});

type env = z.infer<typeof envSchema>
export const env = envSchema.parse(process.env)