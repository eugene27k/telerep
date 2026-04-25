import type { Context } from 'grammy';
import { upsertUser, upsertChat, insertEvent } from '@/lib/db/operations';
import { supabaseAdmin } from '@/lib/db/client';

// Telegram delivers a reaction update each time someone changes their reaction
// on a message. We only credit when the reaction COUNT increased (something new added).
export async function handleMessageReaction(ctx: Context): Promise<void> {
  const upd = ctx.messageReaction;
  if (!upd) return;
  const reactor = upd.user;
  const chat = upd.chat;
  if (!reactor || reactor.is_bot) return;
  if (chat.type !== 'group' && chat.type !== 'supergroup') return;

  if (upd.new_reaction.length <= upd.old_reaction.length) return;

  const chatId = await upsertChat({ id: chat.id, title: chat.title });

  // Find the original message author from our events table.
  const { data: original } = await supabaseAdmin
    .from('events')
    .select('user_id')
    .eq('chat_id', chatId)
    .eq('type', 'message')
    .filter('metadata->>telegram_message_id', 'eq', String(upd.message_id))
    .maybeSingle();

  if (!original) return; // we never saw the original message

  const reactorId = await upsertUser(reactor);
  if (original.user_id === reactorId) return; // no self-reaction credit

  await insertEvent({
    userId: original.user_id as string,
    chatId,
    type: 'reaction',
    metadata: {
      from_telegram_user_id: reactor.id,
      telegram_message_id: upd.message_id,
    },
  });
}
