import { supabaseAdmin } from './client';

export type Chat = {
  id: string;
  telegram_chat_id: number;
  title: string;
  slug: string;
  created_at: string;
};

export type User = {
  id: string;
  telegram_user_id: number;
  username: string | null;
  display_name: string;
  avatar_url: string | null;
};

export type LeaderboardEntry = {
  rank: number;
  user: User;
  score: number;
  message_count: number;
};

export type UserChatStanding = {
  chat: Pick<Chat, 'id' | 'title' | 'slug'>;
  rank: number;
  score: number;
  message_count: number;
};

const TOP_N = 20;

export async function getChatBySlug(slug: string): Promise<Chat | null> {
  const { data, error } = await supabaseAdmin
    .from('chats')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();
  if (error) {
    console.error('[queries] getChatBySlug:', error);
    return null;
  }
  return (data as Chat | null) ?? null;
}

/** Top-N members of a chat by score (desc). Returns rank 1..N. */
export async function getTopMembers(chatId: string): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabaseAdmin
    .from('memberships')
    .select('score, message_count, users(id, telegram_user_id, username, display_name, avatar_url)')
    .eq('chat_id', chatId)
    .is('deleted_at', null)
    .order('score', { ascending: false })
    .limit(TOP_N);

  if (error) {
    console.error('[queries] getTopMembers:', error);
    return [];
  }
  return (data ?? []).map((row, i) => ({
    rank: i + 1,
    user: row.users as unknown as User,
    score: row.score as number,
    message_count: row.message_count as number,
  }));
}

export async function getUserByUsername(username: string): Promise<User | null> {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .ilike('username', username)
    .maybeSingle();
  if (error) {
    console.error('[queries] getUserByUsername:', error);
    return null;
  }
  return (data as User | null) ?? null;
}

/** Returns the user's standing in every chat they're a member of. */
export async function getUserStandings(userId: string): Promise<UserChatStanding[]> {
  const { data, error } = await supabaseAdmin
    .from('memberships')
    .select('score, message_count, chat_id, chats(id, title, slug)')
    .eq('user_id', userId)
    .is('deleted_at', null);

  if (error) {
    console.error('[queries] getUserStandings:', error);
    return [];
  }
  if (!data || data.length === 0) return [];

  // Compute rank per chat in parallel: count members with strictly higher score.
  const standings = await Promise.all(
    data.map(async (row) => {
      const { count } = await supabaseAdmin
        .from('memberships')
        .select('*', { count: 'exact', head: true })
        .eq('chat_id', row.chat_id as string)
        .is('deleted_at', null)
        .gt('score', row.score as number);
      return {
        chat: row.chats as unknown as Pick<Chat, 'id' | 'title' | 'slug'>,
        rank: (count ?? 0) + 1,
        score: row.score as number,
        message_count: row.message_count as number,
      };
    }),
  );
  return standings.sort((a, b) => b.score - a.score);
}
