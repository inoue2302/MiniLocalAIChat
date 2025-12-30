import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { randomUUID } from 'crypto';
import { saveMessage, getSession } from './session';
import { publishToIPFS } from './ipfs';

const app = new Hono();

app.use('/*', cors());

app.get('/health', (c) => {
  return c.json({ ok: true });
});

app.get('/sessions/:id', async (c) => {
  const sessionId = c.req.param('id');

  const session = await getSession(sessionId);

  if (!session) {
    return c.json({ error: 'Session not found' }, 404);
  }

  return c.json(session);
});

app.post('/sessions/:id/publish', async (c) => {
  try {
    const sessionId = c.req.param('id');

    const session = await getSession(sessionId);

    if (!session) {
      return c.json({ error: 'Session not found' }, 404);
    }

    const sessionData = JSON.stringify(session, null, 2);
    const cid = await publishToIPFS(sessionData);

    return c.json({ cid });
  } catch (error) {
    console.error('Error in /sessions/:id/publish:', error);
    return c.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      500
    );
  }
});

app.post('/chat', async (c) => {
  try {
    const body = await c.req.json();
    const { message, sessionId } = body;

    if (!message || typeof message !== 'string') {
      return c.json({ error: 'message is required and must be a string' }, 400);
    }

    const finalSessionId = sessionId || randomUUID();

    const ollamaResponse = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'phi3',
        prompt: message,
        stream: false,
      }),
    });

    if (!ollamaResponse.ok) {
      throw new Error(`Ollama API error: ${ollamaResponse.statusText}`);
    }

    const ollamaData = (await ollamaResponse.json()) as { response: string };
    const reply = ollamaData.response;

    await saveMessage(finalSessionId, message, reply);

    return c.json({
      reply,
      sessionId: finalSessionId,
    });
  } catch (error) {
    console.error('Error in /chat:', error);
    return c.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      500
    );
  }
});

const port = 3001;
console.log(`API server running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
