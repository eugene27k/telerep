import { redirect } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from '@/i18n/navigation';
import { DevLoginForm } from '@/components/dev-login-form';
import { TelegramLoginButton } from '@/components/telegram-login-button';
import { getSession } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

type SearchParams = Promise<{ next?: string }>;

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: SearchParams;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await getSession();
  const sp = await searchParams;
  const next = sp.next ?? `/${locale}`;

  if (session) redirect(next);

  const t = await getTranslations('Login');
  const tCommon = await getTranslations('Common');

  const isDev = process.env.NODE_ENV !== 'production';
  const botUsername = process.env.TELEGRAM_LOGIN_BOT_USERNAME ?? '';
  const authUrl = `/api/auth/telegram?next=${encodeURIComponent(next)}`;

  return (
    <main className="flex-1 w-full max-w-md mx-auto px-4 py-16">
      <Link href="/" className="text-sm text-muted-foreground hover:underline">
        {tCommon('backHome')}
      </Link>
      <h1 className="text-3xl font-bold tracking-tight mt-6 mb-2">{t('title')}</h1>
      <p className="text-muted-foreground mb-8">{t('subtitle')}</p>

      <Card>
        <CardContent className="flex flex-col items-center gap-6 py-8">
          {botUsername ? (
            <TelegramLoginButton botUsername={botUsername} authUrl={authUrl} />
          ) : (
            <p className="text-sm text-destructive">{t('botUsernameMissing')}</p>
          )}

          {isDev ? (
            <>
              <div className="flex items-center gap-3 w-full max-w-xs">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                  {t('devOnly')}
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>
              <DevLoginForm
                next={next}
                cta={t('devLoginCta')}
                placeholder={t('devLoginPlaceholder')}
              />
            </>
          ) : null}
        </CardContent>
      </Card>
    </main>
  );
}
