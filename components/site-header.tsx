import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getSession } from '@/lib/auth/session';

type Props = { locale: string };

export async function SiteHeader({ locale }: Props) {
  const session = await getSession();
  const t = await getTranslations('Header');

  return (
    <header className="border-b">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold tracking-tight text-lg">
          TeleRep
        </Link>
        <nav className="flex items-center gap-5 text-sm">
          <div className="flex gap-3 text-muted-foreground">
            <Link
              href="/"
              locale="uk"
              className={`hover:text-foreground ${locale === 'uk' ? 'text-foreground' : ''}`}
            >
              UK
            </Link>
            <Link
              href="/"
              locale="en"
              className={`hover:text-foreground ${locale === 'en' ? 'text-foreground' : ''}`}
            >
              EN
            </Link>
          </div>
          {session ? (
            <span className="text-muted-foreground">{session.displayName}</span>
          ) : (
            <Link
              href="/login"
              className="font-medium hover:underline underline-offset-4"
            >
              {t('signIn')}
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
