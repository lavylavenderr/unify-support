import { eq } from "drizzle-orm";
import { db } from "index";
import { settings } from "schema/settings";

export async function fetchSetting(key: string): Promise<string | null> {
  const result = await db
    .select()
    .from(settings)
    .where(eq(settings.key, key))
    .limit(1);

  return result[0]?.value || null;
}

export async function writeSetting(
  key: string,
  value: string
): Promise<boolean> {
  await db.insert(settings).values({ key, value });
  return true;
}
