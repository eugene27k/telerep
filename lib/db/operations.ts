import { supabaseAdmin } from './client';

export type TgUser = {
  id: number;
  username?: string;
  first_name: string;
  last_name?: string;
};

export type TgChat = {
  id: number;
  title: string;
};

function getDisplayName(u: TgUser): string {
  const name = [u.first_name, u.last_name].filter(Boolean).join(' ').trim();
  return name || u.username || `user_${u.id}`;
}

function makeSlug(title: string, telegramChatId: number): string {
  const base = title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
  const suffix = Math.abs(telegramChatId).toString(36).slice(-6);
  return base ? `${base}-${suffix}` : `chat-${suffix}`;
}

/** Inserts the user if missing, refreshes display_name/username. Returns users.id. */
export async function upsertUser(tg: TgUser): Promise<string> {
  const { data, error } = await supabaseAdmin
    .from('users')
    .upsert(
      {
        telegram_user_id: tg.id,
        username: tg.username ?? null,
        display_name: getDisplayName(tg),
      },
      { onConflict: 'telegram_user_id' },
    )
    .select('id')
    .single();
  if (error) throw error;
  return data.id as string;
}

/**
 * Inserts the chat if missing (slug + added_by_user_id stay stable across calls).
 * Pass addedByUserId only when you actually know who added the bot (membership event).
 * Returns chats.id.
 */
export async function upsertChat(
  tg: TgChat,
  addedByUserId?: string,
): Promise<string> {
  const { data: existing } = await supabaseAdmin
    .from('chats')
    .select('id')
    .eq('telegram_chat_id', tg.id)
    .maybeSingle();
  if (existing) return existing.id as string;

  const { data, error } = await supabaseAdmin
    .from('chats')
    .insert({
      telegram_chat_id: tg.id,
      title: tg.title,
      slug: makeSlug(tg.title, tg.id),
      added_by_user_id: addedByUserId ?? null,
    })
    .select('id')
    .single();
  if (error) throw error;
  return data.id as string;
}

export type EventType = 'message' | 'reply' | 'reaction';

export async function insertEvent(args: {
  userId: string;
  chatId: string;
  type: EventType;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  const { error } = await supabaseAdmin.from('events').insert({
    user_id: args.userId,
    chat_id: args.chatId,
    type: args.type,
    metadata: args.metadata ?? {},
  });
  if (error) console.error('[db] insertEvent failed:', error.message);
}
