import { Telegraf } from 'telegraf';
import { handleStart } from './handlers/start.js';
import { handlePhoto } from './handlers/photo.js';
import { handleMessage } from './handlers/message.js';

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

bot.start(handleStart);
bot.on('photo', handlePhoto);
bot.on('message', handleMessage);

export function startBot() {
  bot.launch();
  console.log('Telegram bot started');
  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
}

export { bot };
