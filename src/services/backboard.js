import { BackboardClient } from 'backboard-sdk';

const client = new BackboardClient({ apiKey: process.env.BACKBOARD_API_KEY });

export async function sendMessage({ content, threadId, memory = 'Auto' }) {
  return client.sendMessage({ content, threadId, memory });
}
