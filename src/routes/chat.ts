import { Hono } from 'hono';
import { eq, or, and, desc, not, like, sql } from 'drizzle-orm';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { users, conversations, messages } from '@/db/schema';
import { requireAuth } from './auth';
import type { AppEnv } from '../index';

export const chatRouter = new Hono<AppEnv>();

// Explicit numeric coercion safeguards against injection and malformed parameters
const idParamSchema = z.object({ id: z.coerce.number().int().positive() });

chatRouter.get('/conversations', requireAuth, async (c) => {
  const db = c.var.db;
  const user = c.var.user!;

  const userConvos = await db
    .select({
      id: conversations.id,
      lastMessageAt: conversations.lastMessageAt,
      targetUser: {
        id: users.id,
        username: users.username,
        avatarUrl: users.avatarUrl
      }
    })
    .from(conversations)
    .innerJoin(users, or(
      and(eq(conversations.user1Id, user.id), eq(users.id, conversations.user2Id)),
      and(eq(conversations.user2Id, user.id), eq(users.id, conversations.user1Id))
    ))
    .orderBy(desc(conversations.lastMessageAt));

  return c.json(userConvos);
});

chatRouter.post('/conversations', requireAuth, zValidator('json', z.object({ targetUserId: z.number().int().positive() })), async (c) => {
  const db = c.var.db;
  const user = c.var.user!;
  const { targetUserId } = c.req.valid('json');

  if (user.id === targetUserId) return c.json({ error: 'Loopback connections disabled' }, 400);

  let conv = await db.select().from(conversations).where(
    or(
      and(eq(conversations.user1Id, user.id), eq(conversations.user2Id, targetUserId)),
      and(eq(conversations.user1Id, targetUserId), eq(conversations.user2Id, user.id))
    )
  ).get();

  if (!conv) {
    const inserted = await db.insert(conversations).values({ user1Id: user.id, user2Id: targetUserId }).returning();
    conv = inserted[0];
  }

  const targetUser = await db.select({ id: users.id, username: users.username, avatarUrl: users.avatarUrl }).from(users).where(eq(users.id, targetUserId)).get();
  return c.json({ id: conv.id, lastMessageAt: conv.lastMessageAt, targetUser });
});

chatRouter.get('/messages/:id', requireAuth, zValidator('param', idParamSchema), async (c) => {
  const db = c.var.db;
  const user = c.var.user!;
  const { id: conversationId } = c.req.valid('param');
  
  const limit = Math.min(100, parseInt((c.req.query('limit') || '50') as string) || 50);
  const offset = parseInt((c.req.query('offset') || '0') as string) || 0;
  
  const conv = await db.select().from(conversations).where(eq(conversations.id, conversationId)).get();
  if (!conv || (conv.user1Id !== user.id && conv.user2Id !== user.id)) {
    return c.json({ error: 'Unauthorized Access' }, 403);
  }

  const history = await db.select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(desc(messages.createdAt))
    .limit(limit)
    .offset(offset);
    
  return c.json(history.reverse());
});

chatRouter.get('/directory', requireAuth, async (c) => {
  const db = c.var.db;
  const user = c.var.user!;
  const q = c.req.query('q');
  
  const conditions = [not(eq(users.id, user.id))];
  if (q && q.trim().length > 0) {
    conditions.push(like(users.username, `%${q.trim()}%`));
  }

  const directory = await db.select({ id: users.id, username: users.username, avatarUrl: users.avatarUrl })
    .from(users)
    .where(and(...conditions))
    .limit(50);
    
  return c.json(directory);
});

chatRouter.post('/messages/:id', requireAuth, zValidator('param', idParamSchema), zValidator('json', z.object({
  content: z.string().optional(), fileUrl: z.string().nullable().optional(), fileName: z.string().nullable().optional(), fileType: z.string().nullable().optional()
})), async (c) => {
  const db = c.var.db;
  const user = c.var.user!;
  const { id: conversationId } = c.req.valid('param');
  const payload = c.req.valid('json');

  if (!payload.content && !payload.fileUrl) return c.json({ error: 'Empty payload' }, 400);

  const conv = await db.select().from(conversations).where(eq(conversations.id, conversationId)).get();
  if (!conv || (conv.user1Id !== user.id && conv.user2Id !== user.id)) return c.json({ error: 'Unauthorized Access' }, 403);

  try {
    const inserted = await db.insert(messages).values({
      conversationId, senderId: user.id, content: payload.content || '', fileUrl: payload.fileUrl || null, fileName: payload.fileName || null, fileType: payload.fileType || null
    }).returning();

    c.executionCtx.waitUntil(
      db.update(conversations).set({ lastMessageAt: sql`(strftime('%s', 'now'))` }).where(eq(conversations.id, conversationId)).execute()
    );

    return c.json(inserted[0]);
  } catch (err) {
    return c.json({ error: 'Transmission execution failed' }, 500);
  }
});
