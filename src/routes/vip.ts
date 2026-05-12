import { Hono } from 'hono';
import { eq, sql } from 'drizzle-orm';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { users, payments } from '@/db/schema';
import { requireAuth } from './auth';
import { timingSafeEqual } from '@/utils/crypto';
import type { AppEnv } from '../index';

export const vipRouter = new Hono<AppEnv>();

const VIP_FIAT_PRICE = 49.99;
const CURRENCY_CONFIG: Record<string, number> = {
  'btc': 100000000, 'ltc': 100000000, 'doge': 100000000, 'trx': 1000000, 
  'usdt@trx': 1000000, 'usdc@trx': 1000000, 'eth': 1000000000000000000, 'usdt@eth': 1000000,
};

const invoiceSchema = z.object({
  currency: z.string().min(3).max(10)
});

vipRouter.post('/invoice', requireAuth, zValidator('json', invoiceSchema), async (c) => {
  const db = c.var.db;
  const userPayload = c.var.user!;
  const { currency } = c.req.valid('json');

  if (!CURRENCY_CONFIG[currency]) return c.json({ error: 'Unsupported blockchain protocol.' }, 400);

  const user = await db.select({ id: users.id, isVip: users.isVip }).from(users).where(eq(users.id, userPayload.id)).get();
  if (!user) return c.json({ error: 'Identity node missing.' }, 404);
  if (user.isVip) return c.json({ error: 'Node already holds VIP clearance.' }, 400);

  try {
    const tickerRes = await fetch(`https://apirone.com/api/v2/ticker?currency=${currency}&fiat=usd`);
    if (!tickerRes.ok) throw new Error('Oracle fetch failed');
    const tickerData = await tickerRes.json() as any;
    
    let cryptoValue = VIP_FIAT_PRICE; 
    if (tickerData?.[currency]?.usd) cryptoValue = VIP_FIAT_PRICE / tickerData[currency].usd;
    else if (tickerData?.usd) cryptoValue = VIP_FIAT_PRICE / tickerData.usd;

    const minorUnits = Math.floor(cryptoValue * CURRENCY_CONFIG[currency]);
    const secretToken = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');
    const callbackUrl = `${c.env.BASE_URL}/api/vip/webhook?secret=${secretToken}`;

    const apironeRes = await fetch(`https://apirone.com/api/v2/accounts/${c.env.APIRONE_ACCOUNT}/invoices`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: minorUnits, currency: currency, lifetime: 3600,
        "callback-url": callbackUrl,
        "user-data": { title: "Lifetime VIP Access", merchant: "DevKit Elite Network", price: `$${VIP_FIAT_PRICE}` },
        linkback: `${c.env.BASE_URL}/vip`
      })
    });

    const invoiceData = await apironeRes.json() as any;
    if (!invoiceData.invoice || !invoiceData['invoice-url']) return c.json({ error: 'Invoice initialization failed at external provider.' }, 500);

    await db.insert(payments).values({
      userId: user.id, invoiceId: invoiceData.invoice, fiatAmount: VIP_FIAT_PRICE,
      cryptoAmount: minorUnits, currency: currency, secretToken: secretToken, status: 'created'
    });

    return c.json({ success: true, invoiceUrl: invoiceData['invoice-url'] });
  } catch (err) {
    return c.json({ error: 'Systemic failure during payload construction.' }, 500);
  }
});

// FIX: Refined Zod Schema to strictly map to the Drizzle SQLite literal union types
const webhookSchema = z.object({
  invoice: z.string().min(10),
  status: z.enum(['created', 'paid', 'partpaid', 'completed', 'expired'])
});

vipRouter.post('/webhook', zValidator('json', webhookSchema), async (c) => {
  const db = c.var.db;
  const secret = c.req.query('secret');
  
  if (!secret) return c.text('Missing cryptographic parameters', 400);

  try {
    const { invoice, status } = c.req.valid('json');
    const tx = await db.select().from(payments).where(eq(payments.invoiceId, invoice)).get();
    
    // Constant-time execution check to prevent timing attacks
    if (!tx || !timingSafeEqual(tx.secretToken, secret)) {
      return c.text('Cryptographic signature validation failed', 403);
    }

    // Execution: Atomic transaction
    if (status === 'paid' || status === 'completed') {
      await db.batch([
        db.update(payments).set({ status, updatedAt: sql`(strftime('%s', 'now'))` }).where(eq(payments.id, tx.id)),
        db.update(users).set({ isVip: true, vipSince: sql`(strftime('%s', 'now'))` }).where(eq(users.id, tx.userId))
      ]);
    } else {
      await db.update(payments).set({ status, updatedAt: sql`(strftime('%s', 'now'))` }).where(eq(payments.id, tx.id));
    }

    return c.text('*ok*', 200);
  } catch (err) {
    return c.text('Internal execution fault', 500);
  }
});
