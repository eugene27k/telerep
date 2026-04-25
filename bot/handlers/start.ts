import type { Context } from 'grammy';
import { upsertChat } from '@/lib/db/operations';

export async function handleStart(ctx: Context): Promise<void> {
  const chat = ctx.chat;
  if (!chat) return;

  if (chat.type === 'private') {
    await ctx.reply(
      '👋 Hi! I am TeleRep — a reputation tracker for Telegram communities.\n\n' +
        'To use me, add me as an administrator to your group. ' +
        'I will then track member activity and build a public ranking.',
    );
    return;
  }

  if (chat.type === 'group' || chat.type === 'supergroup' || chat.type === 'channel') {
    await upsertChat({ id: chat.id, title: chat.title ?? 'Untitled' });
    await ctx.reply(
      `✅ TeleRep is tracking activity in *${chat.title ?? 'this chat'}*.\n\n` +
        'Public ranking will appear at https://telerep.app shortly.',
      { parse_mode: 'Markdown' },
    );
  }
}
