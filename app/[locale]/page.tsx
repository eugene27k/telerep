import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabaseAdmin } from '@/lib/db/client';

export const revalidate = 900;

type FeaturedChat = {
  slug: string;
  title: string;
  members: number;
  topScore: number;
};

async function getFeaturedChat(): Promise<FeaturedChat | null> {
  const { data: chat } = await supabaseAdmin
    .from('chats')
    .select('slug, title, id')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!chat) return null;

  const [{ count: members }, { data: topMembership }] = await Promise.all([
    supabaseAdmin
      .from('memberships')
      .select('*', { count: 'exact', head: true })
      .eq('chat_id', chat.id as string)
      .is('deleted_at', null),
    supabaseAdmin
      .from('memberships')
      .select('score')
      .eq('chat_id', chat.id as string)
      .is('deleted_at', null)
      .order('score', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  return {
    slug: chat.slug as string,
    title: chat.title as string,
    members: members ?? 0,
    topScore: (topMembership?.score as number | undefined) ?? 0,
  };
}

function StepCard({
  number,
  title,
  body,
}: {
  number: string;
  title: string;
  body: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="font-mono text-sm text-muted-foreground mb-3">
          {number}
        </div>
        <h3 className="font-semibold text-lg mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
      </CardContent>
    </Card>
  );
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('Home');
  const featured = await getFeaturedChat();
  const botUsername = process.env.TELEGRAM_LOGIN_BOT_USERNAME ?? 'GetTeleRepBot';
  const botUrl = `https://t.me/${botUsername}`;

  return (
    <main className="flex-1 w-full max-w-5xl mx-auto px-4">
      {/* Hero */}
      <section className="py-16 md:py-24 text-center max-w-2xl mx-auto">
        <Badge variant="outline" className="mb-4">
          {t('badge')}
        </Badge>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
          {t('title')}
        </h1>
        <p className="text-lg text-muted-foreground mt-6 leading-relaxed">
          {t('subtitle')}
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href={botUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-full bg-foreground text-background h-11 px-6 text-sm font-medium hover:bg-foreground/90 transition-colors"
          >
            {t('addBotCta')}
          </a>
          {featured ? (
            <Link
              href={`/c/${featured.slug}`}
              className="inline-flex items-center justify-center rounded-full border border-foreground/20 h-11 px-6 text-sm font-medium hover:bg-foreground/5 transition-colors"
            >
              {t('exploreCta')}
            </Link>
          ) : null}
        </div>
      </section>

      {/* How it works */}
      <section className="py-12 border-t">
        <h2 className="text-sm uppercase tracking-wide text-muted-foreground text-center mb-8">
          {t('howItWorksTitle')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StepCard number="01" title={t('step1Title')} body={t('step1Body')} />
          <StepCard number="02" title={t('step2Title')} body={t('step2Body')} />
          <StepCard number="03" title={t('step3Title')} body={t('step3Body')} />
        </div>
      </section>

      {/* Featured community */}
      {featured ? (
        <section className="py-12 border-t">
          <h2 className="text-sm uppercase tracking-wide text-muted-foreground mb-4">
            {t('featuredTitle')}
          </h2>
          <Card>
            <CardContent className="p-6 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <Link
                  href={`/c/${featured.slug}`}
                  className="font-semibold text-xl truncate block hover:underline underline-offset-4"
                >
                  {featured.title}
                </Link>
                <div className="text-sm text-muted-foreground mt-1 tabular-nums">
                  {t('featuredMeta', {
                    members: featured.members,
                    topScore: featured.topScore,
                  })}
                </div>
              </div>
              <Link
                href={`/c/${featured.slug}`}
                className="text-sm font-medium hover:underline underline-offset-4 whitespace-nowrap"
              >
                {t('viewLeaderboard')} →
              </Link>
            </CardContent>
          </Card>
        </section>
      ) : null}
    </main>
  );
}
