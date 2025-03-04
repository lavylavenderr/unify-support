import { varchar, pgTable, text, integer } from "drizzle-orm/pg-core";

export const snippets = pgTable("snippets", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  identifier: varchar().notNull(),
  content: text().notNull(),
});

export type snippetType = typeof snippets.$inferInsert;
