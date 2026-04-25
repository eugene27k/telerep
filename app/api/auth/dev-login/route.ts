import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/client';
import { createSession } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

// Dev-only fake login: lets a developer authenticate as any existing
// Telegram user without going through the real Telegram Login Widget.
// REQUIRED because Telegram's widget refuses to work on localhost / non-HTTPS.
export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return new NextResponse('Not available in production', { status: 403 });
  }

  const body = (await req.json().catch(() => ({}))) as { username?: string };
  const username = body.username?.trim();
  if (!username) {
    return new NextResponse('username required', { status: 400 });
  }

  const { data: user } = await supabaseAdmin
    .from('users')
    .select('id, telegram_user_id, username, display_name')
    .ilike('username', username)
    .maybeSingle();

  if (!user) {
    return new NextResponse(
      'No tracked user with this username. The bot must have seen them in a chat first.',
      { status: 404 },
    );
  }

  await createSession({
    userId: user.id as string,
    telegramUserId: user.telegram_user_id as number,
    username: (user.username as string | null) ?? null,
    displayName: user.display_name as string,
  });

  return NextResponse.json({ ok: true });
}
