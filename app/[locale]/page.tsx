import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Badge } from '@/components/ui/badge';
import { supabaseAdmin } from '@/lib/db/client';

export const revalidate = 900;

async function getFeaturedChatSlug(): Promise<string | null> {
  const { data } = await supabaseAdmin
    .from('chats')
    .select('slug')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data?.slug as string | undefined) ?? null;
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Home');

  const featuredSlug = await getFeaturedChatSlug();

  return (
    <main className="flex-1 flex flex-col items-center justify-center gap-6 p-8 text-center">
      <Badge variant="outline">{t('badge')}</Badge>
      <h1 className="text-5xl font-bold tracking-tight">{t('title')}</h1>
      <p className="text-lg text-muted-foreground max-w-md">{t('subtitle')}</p>

      {featuredSlug ? (
        <Link
          href={`/c/${featuredSlug}`}
          className="mt-2 inline-flex items-center rounded-full border border-foreground/20 px-4 py-2 text-sm font-medium hover:bg-foreground/5 transition-colors"
        >
          {t('exploreCta')} →
        </Link>
      ) : null}

      <div className="flex gap-3 mt-4 text-sm">
        <Link
          href="/"
          locale="uk"
          className="underline underline-offset-4 text-muted-foreground hover:text-foreground"
        >
          Українська
        </Link>
        <Link
          href="/"
          locale="en"
          className="underline underline-offset-4 text-muted-foreground hover:text-foreground"
        >
          English
        </Link>
      </div>
    </main>
  );
}
