import { pgTable, varchar } from "drizzle-orm/pg-core";

export const settings = pgTable("settings", {
  key: varchar().primaryKey(),
  value: varchar().notNull(),
});

export type settingsType = typeof settings.$inferInsert;
