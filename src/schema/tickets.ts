import { relations, sql } from 'drizzle-orm';
import { varchar, pgTable, integer, text, timestamp, boolean } from 'drizzle-orm/pg-core';

export const tickets = pgTable('tickets', {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	channelId: varchar().notNull().unique(),
	dmId: varchar().notNull(),
	authorId: varchar().notNull(),
	claimedBy: varchar(),
	category: varchar({ enum: ['livery', 'uniform', 'threedlogo', 'pr', 'other'] }),
	subscribed: text()
		.array()
		.notNull()
		.default(sql`ARRAY[]::text[]`),
	scheduledCloseTime: timestamp(),
	closed: boolean().default(false)
});

export type ticketType = typeof tickets.$inferSelect

export const ticketRelations = relations(tickets, ({ many }) => ({
	posts: many(ticketMessages)
}));

export const ticketMessages = pgTable('ticketMessages', {
	ticketId: integer(),
	supportMsgId: varchar().unique(),
	clientMsgId: varchar().unique()
});

export const ticketMessagesRelations = relations(ticketMessages, ({ one }) => ({
	ticket: one(tickets, {
		fields: [ticketMessages.ticketId],
		references: [tickets.id]
	})
}));
