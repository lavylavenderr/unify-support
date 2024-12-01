import { timestamp } from 'drizzle-orm/pg-core';
import { text } from 'drizzle-orm/pg-core';
import { pgTable, varchar } from 'drizzle-orm/pg-core';

export const blocklist = pgTable('blocklist', {
	userId: varchar().primaryKey().unique(),
	reason: text(),
	createdAt: timestamp().defaultNow()
});
