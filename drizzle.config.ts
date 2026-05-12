import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './migrations',
  dialect: 'sqlite',
  // We omit dbCredentials here because we use Wrangler to apply migrations,
  // which is the officially recommended path for Cloudflare D1.
});
