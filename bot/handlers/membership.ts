import type { Context } from 'grammy';
import { upsertChat, upsertUser } from '@/lib/db/operations';

// Fires when the bot's own membership in a chat changes (added, removed, promoted).
// Per PRD US-1: bot greets itself with one welcome message when added.
export async function handleMyChatMember(ctx: Context): Promise<void> {
  const upd = ctx.myChatMember;
  if (!upd) return;
  const chat = upd.chat;
  if (chat.type !== 'group' && chat.type !== 'supergroup' && chat.type !== 'channel') return;

  const oldStatus = upd.old_chat_member.status;
  const newStatus = upd.new_chat_member.status;

  const wasOut = oldStatus === 'left' || oldStatus === 'kicked';
  const isIn = newStatus === 'member' || newStatus === 'administrator';

  if (wasOut && isIn) {
    let addedByUserId: string | undefined;
    const adder = upd.from;
    if (adder && !adder.is_bot) {
      addedByUserId = await upsertUser(adder);
    }
    await upsertChat({ id: chat.id, title: chat.title }, addedByUserId);
    try {
      await ctx.api.sendMessage(
        chat.id,
        `👋 Thanks for adding TeleRep! I'll start tracking activity in *${chat.title}* from now on.\n\n` +
          'For best results, please make me an admin and disable group privacy in BotFather.',
        { parse_mode: 'Markdown' },
      );
    } catch (err) {
      console.error('[bot] welcome message failed:', err);
    }
  }
}
