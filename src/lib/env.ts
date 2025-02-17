import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
    DISCORD_TOKEN: z.string(),
    DATABASE_URL: z.string(),
    R2_ENDPOINT: z.string(),
    R2_ACCESSKEY: z.string(),
    R2_SECRETKEY: z.string(),
    CRONITOR_KEY: z.string()
});

type env = z.infer<typeof envSchema>
export const env = envSchema.parse(process.env)
