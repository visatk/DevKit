import { Hono, Context, Next } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq, count, and, sql, desc, gt } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { sign, verify } from 'hono/jwt';
import { setCookie, getCookie, deleteCookie } from 'hono/cookie';
import { users, turnstileEvents, threads, replies } from '@/db/schema';
import { hashPassword, verifyPassword } from '@/utils/crypto';
import type { DrizzleD1Database } from 'drizzle-orm/d1';

export type AuthEnv = {
  Bindings: { 
    DB: D1Database; 
    JWT_SECRET: string; 
    RESEND_API_KEY?: string;
    RESEND_FROM_EMAIL?: string;
    GITHUB_CLIENT_ID?: string;
    GITHUB_CLIENT_SECRET?: string;
    TURNSTILE_SECRET_KEY?: string;
  };
  Variables: { 
    db: DrizzleD1Database;
    user: { id: number; username: string; role: string; exp: number; }; 
  };
};

export const authRouter = new Hono<AuthEnv>();

const getSecret = (c: Context<AuthEnv>): string => c.env.JWT_SECRET || 'super-secure-dev-secret-123';

export const requireAuth = async (c: Context<AuthEnv>, next: Next) => {
  const token = getCookie(c, 'auth_token');
  if (!token) return c.json({ error: 'Unauthorized: Cryptographic token required.' }, 401);

  try {
    const payload = await verify(token, getSecret(c), 'HS256');
    c.set('user', payload as AuthEnv['Variables']['user']);
    await next();
  } catch (err) {
    return c.json({ error: 'Unauthorized: Invalid or expired vector token.' }, 401);
  }
};

const validateTurnstile = async (token: string, secret: string, ip: string) => {
  const formData = new FormData();
  formData.append('secret', secret);
  formData.append('response', token);
  formData.append('remoteip', ip);

  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST', body: formData
    });
    return await res.json() as { success: boolean; ephemeral_id?: string; metadata?: { ephemeral_id?: string }; };
  } catch {
    return { success: false };
  }
};

const sendVerificationEmail = async (email: string, token: string, apiKey: string, fromEmail: string, origin: string) => {
  const verifyUrl = `${origin}/verify-email?token=${token}`;
  
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: fromEmail || 'Visatk <no-reply@ser.visatk.us>', 
      to: [email],
      subject: 'Visatk - Identity Verification',
      html: `
        <div style="font-family: monospace; max-width: 600px; margin: 0 auto; padding: 24px; background: #0a0a0a; color: #e4e4e7; border: 1px solid #27272a; border-radius: 12px;">
          <h2 style="color: #fff; margin-bottom: 16px; font-weight: 800; border-bottom: 1px solid #27272a; padding-bottom: 12px;">Vector Initialization</h2>
          <p style="margin-bottom: 24px; color: #a1a1aa; line-height: 1.6;">A request to bind this address to the network was received. Acknowledge and finalize integration by executing the verification protocol below.</p>
          <a href="${verifyUrl}" style="display: inline-block; padding: 14px 28px; background-color: #f97316; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em;">Authenticate Address</a>
          <p style="margin-top: 32px; font-size: 11px; color: #52525b;">If this transmission is unexpected, disregard immediately. The vector will automatically self-terminate.</p>
        </div>
      `
    })
  });

  if (!res.ok) throw new Error('Verification transmission failed.');
};

const registerSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/, "Alphanumeric and underscores strictly permitted"),
  email: z.string().email(),
  password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Cryptographic strength insufficient (requires uppercase, lowercase, numeric)"),
  turnstileToken: z.string().min(1)
});

authRouter.post('/register', zValidator('json', registerSchema), async (c) => {
  const db = c.var.db || drizzle(c.env.DB);
  const { username, email, password, turnstileToken } = c.req.valid('json');

  const ip = c.req.header('CF-Connecting-IP') || '127.0.0.1';
  const secretKey = c.env.TURNSTILE_SECRET_KEY || '1x00000000000000000000AA';

  const validation = await validateTurnstile(turnstileToken, secretKey, ip);
  if (!validation.success) return c.json({ error: 'Security anomaly detected.' }, 400);

  const ephemeralId = validation.metadata?.ephemeral_id || validation.ephemeral_id;

  if (ephemeralId) {
    const recentSignups = await db.select({ value: count() }).from(turnstileEvents)
      .where(and(eq(turnstileEvents.ephemeralId, ephemeralId), eq(turnstileEvents.eventType, 'signup'), sql`${turnstileEvents.createdAt} > (strftime('%s', 'now') - 3600)`)).get();
    if (recentSignups && recentSignups.value >= 3) return c.json({ error: 'Rate limit exceeded for this node.' }, 429);
  }

  try {
    const existingEmail = await db.select().from(users).where(eq(users.email, email)).get();
    if (existingEmail) return c.json({ error: 'Vector collision: Address registered' }, 409);
    
    const existingUsername = await db.select().from(users).where(eq(users.username, username)).get();
    if (existingUsername) return c.json({ error: 'Vector collision: Identifier assigned' }, 409);

    const passwordHash = await hashPassword(password);
    const verificationToken = crypto.randomUUID();
    
    const totalUsers = await db.select({ value: count() }).from(users).get();
    const isFirstUser = totalUsers?.value === 0;

    const newUser = await db.insert(users).values({ 
      username, email, passwordHash, 
      role: isFirstUser ? 'admin' : 'user',
      isVerified: isFirstUser, 
      verificationToken: isFirstUser ? null : verificationToken
    }).returning();
    
    if (ephemeralId) {
      c.executionCtx.waitUntil(db.insert(turnstileEvents).values({ ephemeralId, userId: newUser[0].id, eventType: 'signup', ipAddress: ip }).execute());
    }

    if (!isFirstUser) {
      if (c.env.RESEND_API_KEY) {
        c.executionCtx.waitUntil(sendVerificationEmail(email, verificationToken, c.env.RESEND_API_KEY, c.env.RESEND_FROM_EMAIL || '', new URL(c.req.url).origin));
      }
      return c.json({ requiresVerification: true, message: "Verification dispatch deployed to target address." }, 201);
    }

    const payload = { id: newUser[0].id, username: newUser[0].username, role: newUser[0].role, exp: Math.floor(Date.now() / 1000) + 604800 };
    const token = await sign(payload, getSecret(c), 'HS256');
    
    setCookie(c, 'auth_token', token, { httpOnly: true, secure: true, sameSite: 'Lax', path: '/', maxAge: 604800 });
    return c.json({ id: newUser[0].id, username: newUser[0].username, role: newUser[0].role, isVerified: true }, 201);
  } catch (err) {
    return c.json({ error: 'Internal pipeline failure.' }, 500);
  }
});

authRouter.post('/login', zValidator('json', z.object({
  email: z.string().email(),
  password: z.string(),
  turnstileToken: z.string().min(1)
})), async (c) => {
  const db = c.var.db || drizzle(c.env.DB);
  const { email, password, turnstileToken } = c.req.valid('json');

  const ip = c.req.header('CF-Connecting-IP') || '127.0.0.1';
  const validation = await validateTurnstile(turnstileToken, c.env.TURNSTILE_SECRET_KEY || '1x00000000000000000000AA', ip);
  if (!validation.success) return c.json({ error: 'Security anomaly detected.' }, 400);

  const user = await db.select().from(users).where(eq(users.email, email)).get();
  if (!user || !user.passwordHash || !(await verifyPassword(password, user.passwordHash))) {
    return c.json({ error: 'Invalid cryptographic parameters.' }, 401);
  }

  if (!user.isVerified) return c.json({ error: 'Node locked. Verification phase pending.' }, 403);

  const ephemeralId = validation.metadata?.ephemeral_id || validation.ephemeral_id;
  if (ephemeralId) c.executionCtx.waitUntil(db.insert(turnstileEvents).values({ ephemeralId, userId: user.id, eventType: 'login', ipAddress: ip }).execute());

  const payload = { id: user.id, username: user.username, role: user.role, exp: Math.floor(Date.now() / 1000) + 604800 };
  const token = await sign(payload, getSecret(c), 'HS256');
  
  setCookie(c, 'auth_token', token, { httpOnly: true, secure: true, sameSite: 'Lax', path: '/', maxAge: 604800 });
  return c.json({ id: user.id, username: user.username, role: user.role, points: user.points, isVip: user.isVip });
});

authRouter.post('/verify-email', zValidator('json', z.object({ token: z.string() })), async (c) => {
  const db = c.var.db || drizzle(c.env.DB);
  const { token } = c.req.valid('json');

  const user = await db.select().from(users).where(eq(users.verificationToken, token)).get();
  
  if (!user) {
    return c.json({ error: 'Invalid or already consumed vector token.' }, 400);
  }

  await db.update(users).set({ 
    isVerified: true, 
    verificationToken: null 
  }).where(eq(users.id, user.id));

  const payload = { id: user.id, username: user.username, role: user.role, exp: Math.floor(Date.now() / 1000) + 604800 };
  const jwt = await sign(payload, getSecret(c), 'HS256');
  
  setCookie(c, 'auth_token', jwt, { httpOnly: true, secure: true, sameSite: 'Lax', path: '/', maxAge: 604800 });
  return c.json({ success: true });
});

authRouter.post('/forgot-password', zValidator('json', z.object({ email: z.string().email(), turnstileToken: z.string() })), async (c) => {
  const db = c.var.db || drizzle(c.env.DB);
  const { email, turnstileToken } = c.req.valid('json');
  
  const ip = c.req.header('CF-Connecting-IP') || '127.0.0.1';
  const validation = await validateTurnstile(turnstileToken, c.env.TURNSTILE_SECRET_KEY || '', ip);
  if (!validation.success) return c.json({ error: 'Security anomaly detected.' }, 400);

  const user = await db.select().from(users).where(eq(users.email, email)).get();
  
  if (!user) return c.json({ message: "If an account exists, a recovery sequence has been dispatched." });

  const resetToken = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');
  const resetTokenExpiry = new Date(Date.now() + 3600000); 

  await db.update(users).set({ resetToken, resetTokenExpiry }).where(eq(users.id, user.id));

  if (c.env.RESEND_API_KEY) {
    const resetUrl = `${new URL(c.req.url).origin}/reset-password?token=${resetToken}`;
    
    c.executionCtx.waitUntil(
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${c.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: c.env.RESEND_FROM_EMAIL || 'Visatk <no-reply@ser.visatk.us>',
          to: [email],
          subject: 'Cryptographic Credential Reset',
          html: `<p>A secure reset request was initiated. <a href="${resetUrl}">Click here to re-key your credentials.</a> The link expires in 1 hour.</p>`
        })
      })
    );
  }

  return c.json({ message: "If an account exists, a recovery sequence has been dispatched." });
});

authRouter.post('/reset-password', zValidator('json', z.object({ 
  token: z.string(), 
  newPassword: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Cryptographic strength insufficient") 
})), async (c) => {
  const db = c.var.db || drizzle(c.env.DB);
  const { token, newPassword } = c.req.valid('json');

  const now = new Date();
  
  const user = await db.select().from(users).where(
    and(
      eq(users.resetToken, token),
      gt(users.resetTokenExpiry, now)
    )
  ).get();

  if (!user) return c.json({ error: 'Reset vector is invalid or expired.' }, 400);

  const newPasswordHash = await hashPassword(newPassword);

  await db.update(users).set({ 
    passwordHash: newPasswordHash, 
    resetToken: null, 
    resetTokenExpiry: null 
  }).where(eq(users.id, user.id));

  return c.json({ success: true, message: "Credentials re-keyed successfully." });
});

authRouter.get('/github', async (c) => {
  const clientId = c.env.GITHUB_CLIENT_ID;
  if (!clientId) return c.json({ error: 'OAuth module inactive' }, 500);
  const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(`${new URL(c.req.url).origin}/api/auth/github/callback`)}&scope=read:user user:email`;
  return c.redirect(url);
});

authRouter.get('/github/callback', async (c) => {
  const code = c.req.query('code');
  if (!code) return c.redirect('/login?error=Authorization+failed');

  try {
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST', headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id: c.env.GITHUB_CLIENT_ID, client_secret: c.env.GITHUB_CLIENT_SECRET, code }),
    });

    const tokenData = await tokenRes.json() as any;
    if (tokenData.error) throw new Error(tokenData.error_description);

    const headers = { 'Authorization': `Bearer ${tokenData.access_token}`, 'User-Agent': 'DevKit-Worker-Edge' };
    const [userRes, emailRes] = await Promise.all([
      fetch('https://api.github.com/user', { headers }),
      fetch('https://api.github.com/user/emails', { headers })
    ]);
    
    const githubUser = await userRes.json() as any;
    const emails = await emailRes.json() as any[];
    
    const primaryEmail = emails.find((e: any) => e.primary && e.verified) || emails.find((e: any) => e.verified) || emails[0];
    if (!primaryEmail || !primaryEmail.email) throw new Error('Verified email vector required.');

    const db = c.var.db || drizzle(c.env.DB);
    let user = await db.select().from(users).where(eq(users.githubId, githubUser.id.toString())).get();

    if (!user) {
      user = await db.select().from(users).where(eq(users.email, primaryEmail.email)).get();
      if (user) {
        await db.update(users).set({ githubId: githubUser.id.toString(), isVerified: true }).where(eq(users.id, user.id));
      } else {
        const isFirstUser = (await db.select({ value: count() }).from(users).get())?.value === 0;
        let username = githubUser.login;
        if (await db.select().from(users).where(eq(users.username, username)).get()) username = `${username}_${Math.floor(Math.random() * 1000)}`;

        const newUser = await db.insert(users).values({
          username, email: primaryEmail.email, githubId: githubUser.id.toString(), avatarUrl: githubUser.avatar_url, role: isFirstUser ? 'admin' : 'user', isVerified: true 
        }).returning();
        user = newUser[0];
      }
    }

    const payload = { id: user.id, username: user.username, role: user.role, exp: Math.floor(Date.now() / 1000) + 604800 };
    const token = await sign(payload, getSecret(c), 'HS256');
    setCookie(c, 'auth_token', token, { httpOnly: true, secure: true, sameSite: 'Lax', path: '/', maxAge: 604800 });
    
    return c.redirect('/');
  } catch (err: any) {
    return c.redirect(`/login?error=${encodeURIComponent(err.message || 'OAuth failure')}`);
  }
});

authRouter.post('/logout', async (c) => {
  deleteCookie(c, 'auth_token', { path: '/', secure: true, sameSite: 'Lax' });
  return c.json({ success: true });
});

authRouter.get('/me', async (c) => {
  const token = getCookie(c, 'auth_token');
  if (!token) return c.json({ user: null }, 401);

  try {
    const payload = await verify(token, getSecret(c), 'HS256');
    const db = c.var.db || drizzle(c.env.DB);
    const user = await db.select().from(users).where(eq(users.id, payload.id as number)).get();
    
    if (!user) throw new Error('Identity missing');
    return c.json({ user: { id: user.id, username: user.username, role: user.role, points: user.points, avatarUrl: user.avatarUrl, isVerified: user.isVerified, isVip: user.isVip, vipSince: user.vipSince } });
  } catch {
    deleteCookie(c, 'auth_token', { path: '/', secure: true, sameSite: 'Lax' });
    return c.json({ user: null }, 401);
  }
});

authRouter.get('/profile/:username', async (c) => {
  const db = c.var.db || drizzle(c.env.DB);
  const targetUsername = c.req.param('username');

  try {
    const targetUser = await db.select({ 
      id: users.id, username: users.username, role: users.role, points: users.points, 
      avatarUrl: users.avatarUrl, createdAt: users.createdAt, isVip: users.isVip, vipSince: users.vipSince 
    }).from(users).where(eq(users.username, targetUsername)).get();

    if (!targetUser) return c.json({ error: 'Target node untraceable in the ledger.' }, 404);

    const [threadCount, replyCount] = await Promise.all([
      db.select({ value: count() }).from(threads).where(eq(threads.authorId, targetUser.id)).get(),
      db.select({ value: count() }).from(replies).where(eq(replies.authorId, targetUser.id)).get()
    ]);

    const recentThreads = await db.select({ 
      id: threads.id, title: threads.title, category: threads.category, upvotes: threads.upvotes, createdAt: threads.createdAt 
    })
    .from(threads).where(eq(threads.authorId, targetUser.id)).orderBy(desc(threads.createdAt)).limit(5).execute();

    return c.json({ 
      user: targetUser, 
      stats: { threads: threadCount?.value || 0, replies: replyCount?.value || 0 }, 
      recentThreads 
    });
  } catch (err) {
    return c.json({ error: 'Profile aggregation fault.' }, 500);
  }
});
