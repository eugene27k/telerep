import { createHash, createHmac } from 'crypto';

export type TelegramAuthData = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
};

const MAX_AUTH_AGE_SECONDS = 24 * 60 * 60;

/** Verifies the HMAC hash returned by the Telegram Login Widget. */
export function verifyTelegramAuth(data: TelegramAuthData): boolean {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error('TELEGRAM_BOT_TOKEN is not set');

  if (Math.floor(Date.now() / 1000) - data.auth_date > MAX_AUTH_AGE_SECONDS) {
    return false;
  }

  const { hash, ...fields } = data;
  const dataCheckString = Object.keys(fields)
    .sort()
    .map((k) => {
      const v = (fields as Record<string, unknown>)[k];
      return v === undefined ? null : `${k}=${v}`;
    })
    .filter((s): s is string => s !== null)
    .join('\n');

  const secretKey = createHash('sha256').update(token).digest();
  const computedHash = createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  return computedHash === hash;
}
