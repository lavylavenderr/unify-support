import { container } from '@sapphire/framework';
import NodeCache from 'node-cache';
import { tickets } from '../schema/tickets';
import { and, eq } from 'drizzle-orm';
import { snippets } from '../schema/snippets';

const cache = new NodeCache({ stdTTL: 3000 });

async function getFromCacheOrDb<T>(key: string | number, queryFn: () => Promise<T | null>): Promise<T | null> {
    const cached = cache.get<T>(key);
    if (cached !== undefined) return cached;

    const result = await queryFn();
    cache.set(key, result || null);

    return result;
}

export async function getTicketFromCache(channelId: string) {
    return getFromCacheOrDb(`ticket:${channelId}`, async () => {
        const result = await container.db.select().from(tickets)
            .where(and(eq(tickets.closed, false), eq(tickets.channelId, channelId)));
        return result[0] || null;
    });
}

export async function getOpenTicketByChannelFromCache(channelId: string) {
    return getFromCacheOrDb(`userTicket:${channelId}`, async () => {
        const result = await container.db.select().from(tickets)
            .where(and(eq(tickets.closed, false), eq(tickets.channelId, channelId)));
        return result[0] || null;
    });
}

export async function getOpenTicketByUserFromCache(authorId: string) {
    return getFromCacheOrDb(`userTicket:${authorId}`, async () => {
        const result = await container.db.select().from(tickets)
            .where(and(eq(tickets.closed, false), eq(tickets.authorId, authorId)));
        return result[0] || null;
    });
}

export async function getOpenTicketByIdFromCache(ticketId: number) {
    return getFromCacheOrDb(`ticketId:${ticketId}`, async () => {
        const result = await container.db.select().from(tickets)
            .where(and(eq(tickets.closed, false), eq(tickets.id, ticketId)));
        return result[0] || null;
    });
}

export async function getSnippetFromCache(snippet: string) {
    return getFromCacheOrDb(`snippet:${snippet}`, async () => {
        const result = await container.db.select().from(snippets).where(eq(snippets.identifier, snippet));
        return result[0] || null;
    });
}

export function flushCache(IdOrIdentifier?: string | number) {
    IdOrIdentifier ? cache.del(IdOrIdentifier) : cache.flushAll();
}
