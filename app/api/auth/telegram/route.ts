import { NextRequest, NextResponse } from 'next/server';
import { verifyTelegramAuth, type TelegramAuthData } from '@/lib/auth/telegram';
import { upsertUser } from '@/lib/db/operations';
import { createSession } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

// Telegram Login Widget callback. The widget either redirects here as GET
// (data-auth-url) or POSTs JSON depending on configuration. We support GET.
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const data: TelegramAuthData = {
    id: Number(sp.get('id')),
    first_name: sp.get('first_name') ?? '',
    last_name: sp.get('last_name') ?? undefined,
    username: sp.get('username') ?? undefined,
    photo_url: sp.get('photo_url') ?? undefined,
    auth_date: Number(sp.get('auth_date')),
    hash: sp.get('hash') ?? '',
  };

  if (!data.id || !data.hash || !verifyTelegramAuth(data)) {
    return new NextResponse('Invalid Telegram auth payload', { status: 400 });
  }

  const userId = await upsertUser({
    id: data.id,
    first_name: data.first_name,
    last_name: data.last_name,
    username: data.username,
  });

  await createSession({
    userId,
    telegramUserId: data.id,
    username: data.username ?? null,
    displayName:
      [data.first_name, data.last_name].filter(Boolean).join(' ').trim() ||
      data.username ||
      `user_${data.id}`,
  });

  const next = sp.get('next') ?? '/';
  // Allow only relative redirects to avoid open-redirect issues.
  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/';
  return NextResponse.redirect(new URL(safeNext, req.url));
}
