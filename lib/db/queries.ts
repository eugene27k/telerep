import { supabaseAdmin } from './client';

export type Chat = {
  id: string;
  telegram_chat_id: number;
  title: string;
  slug: string;
  added_by_user_id: string | null;
  created_at: string;
};

export type ChatMetrics = {
  totalMembers: number;
  activeIn7d: number;
};

export type DailyCount = { day: string; count: number };

export type MemberRow = {
  user: User;
  rank: number;
  score: number;
  message_count: number;
  reaction_count: number;
  last_active_at: string | null;
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

const DAY_MS = 24 * 60 * 60 * 1000;

export async function getChatMetrics(chatId: string): Promise<ChatMetrics> {
  const sevenDaysAgo = new Date(Date.now() - 7 * DAY_MS).toISOString();

  const [{ count: total }, { data: recent }] = await Promise.all([
    supabaseAdmin
      .from('memberships')
      .select('*', { count: 'exact', head: true })
      .eq('chat_id', chatId)
      .is('deleted_at', null),
    supabaseAdmin
      .from('events')
      .select('user_id')
      .eq('chat_id', chatId)
      .gte('created_at', sevenDaysAgo),
  ]);

  const activeUsers = new Set((recent ?? []).map((r) => r.user_id as string));
  return { totalMembers: total ?? 0, activeIn7d: activeUsers.size };
}

/** Daily message counts for the last `days` days (oldest → newest). */
export async function getDailyMessageCounts(
  chatId: string,
  days = 30,
): Promise<DailyCount[]> {
  const since = new Date(Date.now() - days * DAY_MS).toISOString();
  const { data } = await supabaseAdmin
    .from('events')
    .select('created_at')
    .eq('chat_id', chatId)
    .eq('type', 'message')
    .gte('created_at', since);

  const counts = new Map<string, number>();
  for (const e of data ?? []) {
    const day = (e.created_at as string).slice(0, 10);
    counts.set(day, (counts.get(day) ?? 0) + 1);
  }
  const result: DailyCount[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * DAY_MS);
    const day = d.toISOString().slice(0, 10);
    result.push({ day, count: counts.get(day) ?? 0 });
  }
  return result;
}

/** All members of a chat for the searchable dashboard list (no pagination yet). */
export async function getAllMembers(chatId: string): Promise<MemberRow[]> {
  const { data, error } = await supabaseAdmin
    .from('memberships')
    .select(
      'score, message_count, reaction_count, last_active_at, users(id, telegram_user_id, username, display_name, avatar_url)',
    )
    .eq('chat_id', chatId)
    .is('deleted_at', null)
    .order('score', { ascending: false });
  if (error) {
    console.error('[queries] getAllMembers:', error);
    return [];
  }
  return (data ?? []).map((row, i) => ({
    user: row.users as unknown as User,
    rank: i + 1,
    score: row.score as number,
    message_count: row.message_count as number,
    reaction_count: row.reaction_count as number,
    last_active_at: (row.last_active_at as string | null) ?? null,
  }));
}

export type Certificate = {
  id: string;
  user_id: string;
  chat_id: string;
  rank: number;
  issued_at: string;
  issued_by: string | null;
};

export type CertificateView = {
  cert: Certificate;
  user: User;
  chat: Pick<Chat, 'id' | 'title' | 'slug'>;
  issuedBy: Pick<User, 'id' | 'username' | 'display_name'> | null;
};

export async function getCertificate(id: string): Promise<CertificateView | null> {
  const { data: cert, error } = await supabaseAdmin
    .from('certificates')
    .select('id, user_id, chat_id, rank, issued_at, issued_by')
    .eq('id', id)
    .maybeSingle();
  if (error) {
    console.error('[queries] getCertificate:', error);
    return null;
  }
  if (!cert) return null;

  // Two separate joins are clearer than disambiguating the dual FK to users.
  const [userRes, chatRes, issuerRes] = await Promise.all([
    supabaseAdmin
      .from('users')
      .select('id, telegram_user_id, username, display_name, avatar_url')
      .eq('id', cert.user_id as string)
      .maybeSingle(),
    supabaseAdmin
      .from('chats')
      .select('id, title, slug')
      .eq('id', cert.chat_id as string)
      .maybeSingle(),
    cert.issued_by
      ? supabaseAdmin
          .from('users')
          .select('id, username, display_name')
          .eq('id', cert.issued_by as string)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  if (!userRes.data || !chatRes.data) return null;

  return {
    cert: {
      id: cert.id as string,
      user_id: cert.user_id as string,
      chat_id: cert.chat_id as string,
      rank: cert.rank as number,
      issued_at: cert.issued_at as string,
      issued_by: (cert.issued_by as string | null) ?? null,
    },
    user: userRes.data as unknown as User,
    chat: chatRes.data as unknown as Pick<Chat, 'id' | 'title' | 'slug'>,
    issuedBy:
      (issuerRes.data as unknown as Pick<User, 'id' | 'username' | 'display_name'> | null) ??
      null,
  };
}
