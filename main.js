// npm install backboard-sdk
import { BackboardClient } from 'backboard-sdk';

async function main() {
const client = new BackboardClient({ apiKey: 'espr_V_l9qGgsefON_UMVCc-tPQNzunGdzvoOGLIKMVx_8CQ' });

// Send a message — thread and assistant are auto-created
const response = await client.sendMessage({
content: 'Hello! I\'m excited to get started.',
memory: 'Auto',
});
console.log(response.content);

// Continue the conversation using the returned threadId
const followUp = await client.sendMessage({
content: 'What can you help me with?',
threadId: response.threadId,
});
console.log(followUp.content);
}

main();