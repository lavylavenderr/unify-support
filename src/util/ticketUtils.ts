import { and, eq } from "drizzle-orm";
import { db, dragonfly } from "index";
import { tickets, type ticketType } from "schema/tickets";

// Existing Tickets

const fetchTicketFromDatabase = async (
  channelId?: string,
  authorId?: string
) => {
  const query = db
    .select()
    .from(tickets)
    .where(
      and(
        eq(tickets.closed, false),
        authorId
          ? eq(tickets.authorId, authorId)
          : eq(tickets.channelId, channelId!)
      )
    );
  const data = await query;
  const ticketData = data[0] || null;

  if (ticketData) {
    await Promise.all([
      dragonfly.set("ticket:id:" + ticketData.channelId, ticketData, 3600),
      dragonfly.set("ticket:author:" + ticketData.authorId, ticketData, 3600),
    ]);
  }

  return ticketData;
};

export const fetchTicketById = async (
  channelId: string
): Promise<ticketType | null> => {
  const existsInRedis = await dragonfly.exists("ticket:id:" + channelId);
  const ticketData = existsInRedis
    ? ((await dragonfly.get("ticket:id:" + channelId)) as ticketType)
    : await fetchTicketFromDatabase(channelId);

  return ticketData;
};

export const fetchTicketByAuthor = async (
  authorId: string
): Promise<ticketType | null> => {
  const existsInRedis = await dragonfly.exists("ticket:author:" + authorId);
  const ticketData = existsInRedis
    ? ((await dragonfly.get("ticket:author:" + authorId)) as ticketType)
    : await fetchTicketFromDatabase(authorId);

  return ticketData;
};

// New Ticket

export const createNewCachedTicket = async (
  authorId: string,
  channelId: string
): Promise<boolean> => {
  const ticketData = await fetchTicketFromDatabase(authorId!)!;

  await Promise.all([
    dragonfly.set("ticket:id:" + channelId, ticketData, 3600),
    dragonfly.set("ticket:author:" + authorId, ticketData, 3600),
  ]);

  return true;
};

// Close Ticket

export const closeCachedTicket = async (
  channelId: string,
  authorId: string
): Promise<boolean> => {
  await Promise.all([
    dragonfly.delete("ticket:id:" + channelId),
    dragonfly.delete("ticket:author:" + authorId),
  ]);

  return true;
};
