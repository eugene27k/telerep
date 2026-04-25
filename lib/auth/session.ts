import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'telerep_session';
const SESSION_TTL_DAYS = 30;

export type Session = {
  userId: string;
  telegramUserId: number;
  username: string | null;
  displayName: string;
};

function key(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not set');
  return new TextEncoder().encode(secret);
}

export async function createSession(session: Session): Promise<void> {
  const token = await new SignJWT({ ...session })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_DAYS}d`)
    .sign(key());

  const c = await cookies();
  c.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_TTL_DAYS * 24 * 60 * 60,
    path: '/',
  });
}

export async function getSession(): Promise<Session | null> {
  const c = await cookies();
  const token = c.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key());
    return {
      userId: payload.userId as string,
      telegramUserId: payload.telegramUserId as number,
      username: (payload.username as string | null) ?? null,
      displayName: payload.displayName as string,
    };
  } catch {
    return null;
  }
}

export async function destroySession(): Promise<void> {
  const c = await cookies();
  c.delete(COOKIE_NAME);
}
