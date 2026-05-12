import { Hono } from 'hono';
import { secureHeaders } from 'hono/secure-headers';
import { cors } from 'hono/cors';
import { cache } from 'hono/cache';
import { drizzle, DrizzleD1Database } from 'drizzle-orm/d1';
import { desc } from 'drizzle-orm';
import binExtractor from './routes/bin-extractor';

// Domain imports
import { threads } from './db/schema';
import { authRouter } from './routes/auth';
import { forumRouter } from './routes/forum';
import { toolsRouter } from './routes/tools';
import { chatRouter } from './routes/chat';
import { uploadRouter } from './routes/upload';
import { vipRouter } from './routes/vip';

export type AppEnv = {
  Bindings: {
    DB: D1Database;
    BUCKET: R2Bucket;
    JWT_SECRET: string;
    TURNSTILE_SECRET_KEY: string;
    RESEND_API_KEY: string;
    RESEND_FROM_EMAIL: string;
    GITHUB_CLIENT_ID: string;
    GITHUB_CLIENT_SECRET: string;
    APIRONE_ACCOUNT: string;
    BASE_URL: string;
  };
  Variables: {
    db: DrizzleD1Database;
    reqId: string;
    user?: { id: number; username: string; role: string; exp: number; };
  };
};

const app = new Hono<AppEnv>();

// --- Edge Observability & Resource Lifecycle Middleware ---
app.use('*', async (c, next) => {
  c.set('reqId', crypto.randomUUID());
  // Drizzle wrapper instantiation per request vector is optimal for D1
  c.set('db', drizzle(c.env.DB)); 
  await next();
});

// --- Security Boundaries ---
app.use('*', secureHeaders({
  xXssProtection: '1; mode=block',
  xFrameOptions: 'DENY',
  strictTransportSecurity: 'max-age=31536000; includeSubDomains; preload',
  contentSecurityPolicy: {
    defaultSrc: ["'self'"],
    baseUri: ["'self'"],
    formAction: ["'self'"],
    frameAncestors: ["'none'"],
  },
}));

// --- CORS Policy ---
app.use('/api/*', cors({
  origin: ['https://visatk.us', 'http://localhost:5173'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  allowMethods: ['POST', 'GET', 'OPTIONS', 'PUT', 'DELETE'],
  credentials: true,
  maxAge: 86400, // Cache preflight requests for 24 hours to reduce Edge latency
}));

// --- API Routing Matrix ---
app.route('/api/auth', authRouter);
app.route('/api/bin-extractor', binExtractor);
app.route('/api/forum', forumRouter);
app.route('/api/tools', toolsRouter);
app.route('/api/chat', chatRouter);
app.route('/api/upload', uploadRouter);
app.route('/api/vip', vipRouter);

// --- Global Fault Tolerance ---
app.onError((err, c) => {
  console.error(`[${c.var.reqId}] Execution Fault:`, err);
  // Do not leak internal stack traces in production responses
  return c.json({ error: 'Internal Edge Execution Failure.', reqId: c.var.reqId }, 500);
});

app.notFound((c) => {
  return c.json({ error: 'Endpoint untraceable.', reqId: c.var.reqId }, 404);
});

// --- SEO & Static Asset Layer ---

// Cache robots.txt at the Edge via Cloudflare Cache API
app.get(
  '/robots.txt',
  cache({ cacheName: 'seo-cache', cacheControl: 'public, max-age=86400' }),
  (c) => {
    return c.text(
      'User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /*?token=*\nSitemap: https://visatk.us/sitemap.xml'
    );
  }
);

// XML Escaping Utility (Optimized for V8)
const escapeXml = (unsafe: string): string =>
  unsafe.replace(/[<>&'"]/g, (char) => {
    switch (char) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return char;
    }
  });

// Dynamic Sitemap Generation
app.get(
  '/sitemap.xml',
  // Hook into Cloudflare Edge Cache to prevent database spamming during bot crawls
  cache({ cacheName: 'seo-cache', cacheControl: 'public, max-age=3600, stale-while-revalidate=86400' }),
  async (c) => {
    const db = c.var.db;
    
    // Fetch recent threads from D1
    const recentThreads = await db
      .select({ id: threads.id, updatedAt: threads.updatedAt })
      .from(threads)
      .orderBy(desc(threads.updatedAt))
      .limit(1000);

    const staticRoutes = ['', '/bin-checker', '/card-checker', '/fake-address', '/vip'];
    
    // Array joining avoids the memory overhead of string concatenation in a loop
    const staticUrls = staticRoutes.map((route) => `  <url>
    <loc>https://visatk.us${escapeXml(route)}</loc>
    <changefreq>daily</changefreq>
    <priority>${route === '' ? '1.0' : '0.8'}</priority>
  </url>\n`).join('');

    const dynamicUrls = recentThreads.map((thread) => {
      const date = thread.updatedAt ? new Date(thread.updatedAt).toISOString() : new Date().toISOString();
      return `  <url>
    <loc>https://visatk.us/forum/${thread.id}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>\n`;
    }).join('');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${staticUrls}${dynamicUrls}</urlset>`;

    // hono/cache sets the Cache-Control automatically based on the middleware config, 
    // but the Content-Type header must be explicit for the browser/crawler.
    c.header('Content-Type', 'application/xml; charset=utf-8');
    return c.body(xml);
  }
);

// Idiomatic Hono Export for Cloudflare Workers
export default app;
