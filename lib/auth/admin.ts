type ChatAdmin = { user: { id: number } };

/** Live check against the Telegram API. Bot must be a member of the chat. */
async function fetchTelegramChatAdmins(telegramChatId: number): Promise<number[]> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return [];
  const url = `https://api.telegram.org/bot${token}/getChatAdministrators`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: telegramChatId }),
    cache: 'no-store',
  });
  const data = (await res.json()) as { ok: boolean; result?: ChatAdmin[] };
  if (!data.ok || !data.result) return [];
  return data.result.map((a) => a.user.id);
}

/**
 * Returns true if the given user is an admin of the chat.
 * Fast path: matches stored added_by_user_id.
 * Slow path: live check against Telegram API.
 */
export async function isChatAdmin(args: {
  addedByUserId: string | null;
  telegramChatId: number;
  sessionUserId: string;
  sessionTelegramUserId: number;
}): Promise<boolean> {
  if (args.addedByUserId && args.addedByUserId === args.sessionUserId) return true;
  const adminIds = await fetchTelegramChatAdmins(args.telegramChatId);
  return adminIds.includes(args.sessionTelegramUserId);
}
