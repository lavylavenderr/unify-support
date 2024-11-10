import { container } from '@sapphire/framework';
import NodeCache from 'node-cache';
import { tickets } from '../schema/tickets';
import { and, eq } from 'drizzle-orm';
import { snippets } from '../schema/snippets';

const cache = new NodeCache({ stdTTL: 3000 });

async function getFromCacheOrDb<T>(key: string, queryFn: () => Promise<T | null>): Promise<T | null> {
    const cached = cache.get<T>(key);
    if (cached !== undefined) return cached;

    const result = await queryFn();
    if (result) cache.set(key, result);

    return result;
}

async function lookupAndCacheTicket(channelId?: string, authorId?: string, ticketId?: number) {
    if (ticketId !== undefined) {
        return getFromCacheOrDb(`ticket:id:${ticketId}`, async () => {
            const result = await container.db.select().from(tickets)
                .where(and(eq(tickets.closed, false), eq(tickets.id, ticketId)));
            return result[0] || null;
        });
    }

    const query = container.db.select().from(tickets).where(
        and(eq(tickets.closed, false),
            channelId ? eq(tickets.channelId, channelId) : eq(tickets.authorId, authorId!)
    ));
    const result = await query;
    
    const ticket = result[0] || null;
    if (ticket) cache.set(`ticket:id:${ticket.id}`, ticket);

    return ticket;
}

export async function getTicketFromCache(channelId: string) {
    return lookupAndCacheTicket(channelId);
}

export async function getOpenTicketByChannelFromCache(channelId: string) {
    return lookupAndCacheTicket(channelId);
}

export async function getOpenTicketByUserFromCache(authorId: string) {
    return lookupAndCacheTicket(undefined, authorId);
}

export async function getOpenTicketByIdFromCache(ticketId: number) {
    return lookupAndCacheTicket(undefined, undefined, ticketId);
}

export async function getSnippetFromCache(snippet: string) {
    return getFromCacheOrDb(`snippet:${snippet}`, async () => {
        const result = await container.db.select().from(snippets).where(eq(snippets.identifier, snippet));
        return result[0] || null;
    });
}

export function flushCache(idOrIdentifier?: string | number) {
    if (typeof idOrIdentifier === 'number') {
        cache.del(`ticket:id:${idOrIdentifier}`);
    } else if (typeof idOrIdentifier === 'string') {
        cache.del(`snippet:${idOrIdentifier}`);
    } else {
        cache.flushAll();
    }
}
