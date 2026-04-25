import { Bot } from 'grammy';
import { handleStart } from './handlers/start';
import { handleMyChatMember } from './handlers/membership';
import { handleMessage } from './handlers/message';
import { handleMessageReaction } from './handlers/reaction';

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) throw new Error('TELEGRAM_BOT_TOKEN is not set');

const bot = new Bot(token);

bot.command('start', handleStart);
bot.on('my_chat_member', handleMyChatMember);
bot.on('message', handleMessage);
bot.on('message_reaction', handleMessageReaction);

bot.catch((err) => {
  console.error('[bot] error:', err);
});

// We must explicitly opt in — message_reaction and chat_member updates
// are NOT delivered by default.
bot.start({
  allowed_updates: [
    'message',
    'edited_message',
    'my_chat_member',
    'message_reaction',
  ],
  onStart: (info) => console.log(`[bot] @${info.username} polling started`),
});
