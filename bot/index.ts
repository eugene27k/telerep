import { Bot } from 'grammy';

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) throw new Error('TELEGRAM_BOT_TOKEN is not set');

const bot = new Bot(token);

bot.command('start', async (ctx) => {
  await ctx.reply(
    '👋 TeleRep bot is running!\n\nAdd me as an admin to your group and I will start tracking member activity.',
  );
});

bot.on('message', (ctx) => {
  console.log(`[bot] message from ${ctx.from?.username ?? ctx.from?.id} in chat ${ctx.chat.id}`);
});

bot.catch((err) => {
  console.error('[bot] error:', err);
});

bot.start({ onStart: () => console.log('[bot] polling started') });
