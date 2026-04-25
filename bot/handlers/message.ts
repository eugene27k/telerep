import type { Context } from 'grammy';
import { upsertUser, upsertChat, insertEvent } from '@/lib/db/operations';

// Service-message keys we ignore (joins, leaves, title changes, etc.)
const SERVICE_KEYS = [
  'new_chat_members',
  'left_chat_member',
  'new_chat_title',
  'new_chat_photo',
  'delete_chat_photo',
  'group_chat_created',
  'supergroup_chat_created',
  'channel_chat_created',
  'pinned_message',
  'migrate_to_chat_id',
  'migrate_from_chat_id',
] as const;

function isServiceMessage(msg: Record<string, unknown>): boolean {
  return SERVICE_KEYS.some((k) => k in msg);
}

export async function handleMessage(ctx: Context): Promise<void> {
  const msg = ctx.message;
  const from = ctx.from;
  const chat = ctx.chat;
  if (!msg || !from || !chat) return;

  if (from.is_bot) return;
  if (chat.type !== 'group' && chat.type !== 'supergroup') return;
  if (isServiceMessage(msg as unknown as Record<string, unknown>)) return;

  const userId = await upsertUser(from);
  const chatId = await upsertChat({ id: chat.id, title: chat.title });

  await insertEvent({
    userId,
    chatId,
    type: 'message',
    metadata: {
      telegram_message_id: msg.message_id,
      has_media: Boolean(msg.photo || msg.video || msg.document || msg.animation || msg.voice),
      length: msg.text?.length ?? msg.caption?.length ?? 0,
    },
  });

  // Reply credit goes to the AUTHOR of the original message (not the replier).
  const replied = msg.reply_to_message;
  if (replied?.from && !replied.from.is_bot && replied.from.id !== from.id) {
    const repliedUserId = await upsertUser(replied.from);
    await insertEvent({
      userId: repliedUserId,
      chatId,
      type: 'reply',
      metadata: {
        from_telegram_user_id: from.id,
        telegram_message_id: replied.message_id,
      },
    });
  }
}
