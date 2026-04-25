import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { isChatAdmin } from '@/lib/auth/admin';
import { getChatBySlug } from '@/lib/db/queries';
import { supabaseAdmin } from '@/lib/db/client';
import { issueCertificate } from '@/lib/db/operations';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Body = { chatSlug?: string; userId?: string };

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return new NextResponse('Unauthorized', { status: 401 });

  const body = (await req.json().catch(() => ({}))) as Body;
  if (!body.chatSlug || !body.userId) {
    return new NextResponse('chatSlug and userId required', { status: 400 });
  }

  const chat = await getChatBySlug(body.chatSlug);
  if (!chat) return new NextResponse('Chat not found', { status: 404 });

  const allowed = await isChatAdmin({
    addedByUserId: chat.added_by_user_id,
    telegramChatId: chat.telegram_chat_id,
    sessionUserId: session.userId,
    sessionTelegramUserId: session.telegramUserId,
  });
  if (!allowed) return new NextResponse('Forbidden', { status: 403 });

  // Look up the recipient's score, then derive their current rank.
  const { data: membership } = await supabaseAdmin
    .from('memberships')
    .select('score')
    .eq('chat_id', chat.id)
    .eq('user_id', body.userId)
    .is('deleted_at', null)
    .maybeSingle();
  if (!membership) {
    return new NextResponse('Recipient is not a member of this chat', { status: 404 });
  }

  const { count } = await supabaseAdmin
    .from('memberships')
    .select('*', { count: 'exact', head: true })
    .eq('chat_id', chat.id)
    .is('deleted_at', null)
    .gt('score', membership.score as number);
  const rank = (count ?? 0) + 1;

  try {
    const id = await issueCertificate({
      userId: body.userId,
      chatId: chat.id,
      rank,
      issuedBy: session.userId,
    });
    return NextResponse.json({
      id,
      verifyUrl: `/verify/${id}`,
      pdfUrl: `/api/certificates/${id}/pdf`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
