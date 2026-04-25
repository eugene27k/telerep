import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/client';
import { computeScore } from '@/lib/scoring';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

type EventRow = {
  user_id: string;
  chat_id: string;
  type: 'message' | 'reaction' | 'reply';
  created_at: string;
};

type Agg = {
  user_id: string;
  chat_id: string;
  messages: number;
  reactions: number;
  replies: number;
  last_active_at: string;
};

const DAY_MS = 24 * 60 * 60 * 1000;

export async function GET(request: Request) {
  const auth = request.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  // TODO: when events table > ~100k rows, switch to a Postgres aggregate function.
  const { data: events, error } = await supabaseAdmin
    .from('events')
    .select('user_id, chat_id, type, created_at')
    .limit(100_000);

  if (error) {
    console.error('[cron] failed to fetch events:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const agg = new Map<string, Agg>();
  for (const e of (events ?? []) as EventRow[]) {
    const key = `${e.user_id}:${e.chat_id}`;
    let row = agg.get(key);
    if (!row) {
      row = {
        user_id: e.user_id,
        chat_id: e.chat_id,
        messages: 0,
        reactions: 0,
        replies: 0,
        last_active_at: e.created_at,
      };
      agg.set(key, row);
    }
    if (e.type === 'message') row.messages += 1;
    else if (e.type === 'reaction') row.reactions += 1;
    else if (e.type === 'reply') row.replies += 1;
    if (e.created_at > row.last_active_at) row.last_active_at = e.created_at;
  }

  const now = Date.now();
  const memberships = [...agg.values()].map((row) => {
    const days = Math.floor((now - new Date(row.last_active_at).getTime()) / DAY_MS);
    return {
      user_id: row.user_id,
      chat_id: row.chat_id,
      message_count: row.messages,
      reaction_count: row.reactions,
      score: computeScore({
        messages: row.messages,
        reactions: row.reactions,
        replies: row.replies,
        daysSinceLastActive: days,
      }),
      last_active_at: row.last_active_at,
    };
  });

  if (memberships.length === 0) {
    return NextResponse.json({ updated: 0, eventsScanned: events?.length ?? 0 });
  }

  const { error: upsertError } = await supabaseAdmin
    .from('memberships')
    .upsert(memberships, { onConflict: 'user_id,chat_id' });

  if (upsertError) {
    console.error('[cron] upsert failed:', upsertError);
    return NextResponse.json({ error: upsertError.message }, { status: 500 });
  }

  return NextResponse.json({
    updated: memberships.length,
    eventsScanned: events?.length ?? 0,
  });
}
