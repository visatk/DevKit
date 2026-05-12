import { sqliteTable, text, integer, real, primaryKey, index } from 'drizzle-orm/sqlite-core';
import { sql, relations } from 'drizzle-orm';

// ==========================================
// 1. Core Authentication & Identity
// ==========================================

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash'),
  githubId: text('github_id').unique(),
  role: text('role', { enum: ['admin', 'moderator', 'user'] }).notNull().default('user'),
  points: integer('points').notNull().default(100),
  avatarUrl: text('avatar_url'), 
  isVerified: integer('is_verified', { mode: 'boolean' }).notNull().default(false),
  isVip: integer('is_vip', { mode: 'boolean' }).notNull().default(false),
  vipSince: integer('vip_since', { mode: 'timestamp' }),
  verificationToken: text('verification_token'),
  resetToken: text('reset_token'),
  resetTokenExpiry: integer('reset_token_expiry', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s', 'now'))`),
}, (table) => ({
  usernameIdx: index('username_idx').on(table.username),
  emailIdx: index('email_idx').on(table.email),
  githubIdIdx: index('github_id_idx').on(table.githubId),
}));

// ==========================================
// 2. Apirone Cryptographic Payment Ledger
// ==========================================

export const payments = sqliteTable('payments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  invoiceId: text('invoice_id').unique(),
  fiatAmount: real('fiat_amount').notNull(),
  cryptoAmount: integer('crypto_amount').notNull(), 
  currency: text('currency').notNull(), 
  status: text('status', { enum: ['created', 'paid', 'partpaid', 'completed', 'expired'] }).notNull().default('created'),
  secretToken: text('secret_token').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s', 'now'))`),
});

// ==========================================
// 3. Forum Architecture
// ==========================================

export const threads = sqliteTable('threads', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  authorId: integer('author_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  author: text('author').notNull(),
  category: text('category').notNull().default('general'),
  title: text('title').notNull(),
  content: text('content').notNull(),
  lockedContent: text('locked_content'),
  unlockCost: integer('unlock_cost').notNull().default(0),
  upvotes: integer('upvotes').notNull().default(0),
  views: integer('views').notNull().default(0),
  replyCount: integer('reply_count').notNull().default(0),
  isPinned: integer('is_pinned', { mode: 'boolean' }).notNull().default(false),
  isLocked: integer('is_locked', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s', 'now'))`),
}, (table) => ({
  authorIdIdx: index('threads_author_id_idx').on(table.authorId),
  categoryIdx: index('threads_category_idx').on(table.category),
  createdAtIdx: index('threads_created_at_idx').on(table.createdAt),
}));

export const replies = sqliteTable('replies', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  threadId: integer('thread_id').notNull().references(() => threads.id, { onDelete: 'cascade' }),
  authorId: integer('author_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  author: text('author').notNull(),
  content: text('content').notNull(),
  upvotes: integer('upvotes').notNull().default(0),
  isAcceptedAnswer: integer('is_accepted_answer', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s', 'now'))`),
}, (table) => ({
  threadIdIdx: index('replies_thread_id_idx').on(table.threadId),
  authorIdIdx: index('replies_author_id_idx').on(table.authorId),
}));

// ==========================================
// 4. Forum Execution Vectors (Unlocks & Votes)
// ==========================================

export const threadUnlocks = sqliteTable('thread_unlocks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  threadId: integer('thread_id').notNull().references(() => threads.id, { onDelete: 'cascade' }),
  pointsSpent: integer('points_spent').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s', 'now'))`),
});

export const threadVotes = sqliteTable('thread_votes', {
  threadId: integer('thread_id').notNull().references(() => threads.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  voteType: integer('vote_type').notNull(), 
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s', 'now'))`),
}, (t) => ({
  pk: primaryKey({ columns: [t.threadId, t.userId] }),
}));

export const replyVotes = sqliteTable('reply_votes', {
  replyId: integer('reply_id').notNull().references(() => replies.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  voteType: integer('vote_type').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s', 'now'))`),
}, (t) => ({
  pk: primaryKey({ columns: [t.replyId, t.userId] }),
}));

// ==========================================
// 5. Secure Messaging & Telemetry
// ==========================================

export const conversations = sqliteTable('conversations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  user1Id: integer('user1_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  user2Id: integer('user2_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  lastMessageAt: integer('last_message_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s', 'now'))`),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s', 'now'))`),
});

export const messages = sqliteTable('messages', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  conversationId: integer('conversation_id').notNull().references(() => conversations.id, { onDelete: 'cascade' }),
  senderId: integer('sender_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').default(''),
  fileUrl: text('file_url'),
  fileName: text('file_name'),
  fileType: text('file_type'),
  isRead: integer('is_read', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s', 'now'))`),
});

export const turnstileEvents = sqliteTable('turnstile_events', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  ephemeralId: text('ephemeral_id').notNull(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
  eventType: text('event_type').notNull(),
  ipAddress: text('ip_address'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s', 'now'))`),
}, (table) => ({
  ephemeralIdIdx: index('ephemeral_id_idx').on(table.ephemeralId),
  createdAtIdx: index('turnstile_created_at_idx').on(table.createdAt),
}));

// ==========================================
// 6. ORM Relations Configurations
// ==========================================

export const usersRelations = relations(users, ({ many }) => ({
  threads: many(threads),
  replies: many(replies),
  payments: many(payments),
  sentMessages: many(messages),
}));

export const threadsRelations = relations(threads, ({ one, many }) => ({
  authorNode: one(users, {
    fields: [threads.authorId],
    references: [users.id],
  }),
  replies: many(replies),
  unlocks: many(threadUnlocks),
}));

export const repliesRelations = relations(replies, ({ one }) => ({
  thread: one(threads, {
    fields: [replies.threadId],
    references: [threads.id],
  }),
  authorNode: one(users, {
    fields: [replies.authorId],
    references: [users.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  userNode: one(users, {
    fields: [payments.userId],
    references: [users.id],
  }),
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  user1Node: one(users, {
    fields: [conversations.user1Id],
    references: [users.id],
    relationName: 'user1Conversations'
  }),
  user2Node: one(users, {
    fields: [conversations.user2Id],
    references: [users.id],
    relationName: 'user2Conversations'
  }),
  messages: many(messages)
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id]
  }),
  senderNode: one(users, {
    fields: [messages.senderId],
    references: [users.id]
  })
}));
