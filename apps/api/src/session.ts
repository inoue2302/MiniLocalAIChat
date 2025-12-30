import { promises as fs } from 'fs';
import path from 'path';

const DATA_DIR = path.join(__dirname, '..', 'data', 'sessions');

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface Session {
  sessionId: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export async function ensureDataDir(): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating data directory:', error);
  }
}

export async function saveMessage(
  sessionId: string,
  userMessage: string,
  assistantReply: string
): Promise<void> {
  await ensureDataDir();

  const sessionPath = path.join(DATA_DIR, `${sessionId}.json`);
  const timestamp = new Date().toISOString();

  let session: Session;

  try {
    const content = await fs.readFile(sessionPath, 'utf-8');
    session = JSON.parse(content);
  } catch {
    session = {
      sessionId,
      messages: [],
      createdAt: timestamp,
      updatedAt: timestamp,
    };
  }

  session.messages.push(
    {
      role: 'user',
      content: userMessage,
      timestamp,
    },
    {
      role: 'assistant',
      content: assistantReply,
      timestamp,
    }
  );

  session.updatedAt = timestamp;

  await fs.writeFile(sessionPath, JSON.stringify(session, null, 2), 'utf-8');
}

export async function getSession(sessionId: string): Promise<Session | null> {
  const sessionPath = path.join(DATA_DIR, `${sessionId}.json`);

  try {
    const content = await fs.readFile(sessionPath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}
