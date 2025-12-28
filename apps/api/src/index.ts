import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono();

app.use('/*', cors());

app.get('/health', (c) => {
  return c.json({ ok: true });
});

const port = 3001;
console.log(`API server running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
