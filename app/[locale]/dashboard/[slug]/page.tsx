import { notFound, redirect } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from '@/i18n/navigation';
import { LeaderboardRow } from '@/components/leaderboard-row';
import { ActivityChart } from '@/components/activity-chart';
import { MemberSearchList } from '@/components/member-search-list';
import { IssueCertButton } from '@/components/issue-cert-button';
import {
  getChatBySlug,
  getChatMetrics,
  getDailyMessageCounts,
  getTopMembers,
  getAllMembers,
} from '@/lib/db/queries';
import { getSession } from '@/lib/auth/session';
import { isChatAdmin } from '@/lib/auth/admin';

export const dynamic = 'force-dynamic';

type Params = Promise<{ locale: string; slug: string }>;

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">
          {label}
        </div>
        <div className="font-mono tabular-nums text-3xl font-bold mt-1">
          {value}
        </div>
      </CardContent>
    </Card>
  );
}

export default async function DashboardPage({ params }: { params: Params }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const session = await getSession();
  const dashboardPath = `/${locale}/dashboard/${slug}`;
  if (!session) {
    redirect(`/${locale}/login?next=${encodeURIComponent(dashboardPath)}`);
  }

  const chat = await getChatBySlug(slug);
  if (!chat) notFound();

  const allowed = await isChatAdmin({
    addedByUserId: chat.added_by_user_id,
    telegramChatId: chat.telegram_chat_id,
    sessionUserId: session.userId,
    sessionTelegramUserId: session.telegramUserId,
  });

  const t = await getTranslations('Dashboard');
  const tCommon = await getTranslations('Common');

  if (!allowed) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center gap-3 p-8 text-center">
        <h1 className="text-2xl font-semibold">{t('forbiddenTitle')}</h1>
        <p className="text-muted-foreground max-w-sm">{t('forbiddenBody')}</p>
        <Link href="/" className="mt-4 text-sm underline underline-offset-4">
          {tCommon('backHome')}
        </Link>
      </main>
    );
  }

  const [metrics, daily, top, allMembers] = await Promise.all([
    getChatMetrics(chat.id),
    getDailyMessageCounts(chat.id, 30),
    getTopMembers(chat.id),
    getAllMembers(chat.id),
  ]);

  return (
    <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-12">
      <div className="mb-6 flex items-center justify-between gap-4 text-sm">
        <Link href="/" className="text-muted-foreground hover:underline">
          {tCommon('backHome')}
        </Link>
        <form action={`/api/auth/logout?next=${encodeURIComponent(`/${locale}`)}`} method="post">
          <button type="submit" className="text-muted-foreground hover:underline">
            {t('logout')} ({session.displayName})
          </button>
        </form>
      </div>

      <header className="mb-8 flex items-baseline justify-between gap-4">
        <div>
          <Badge variant="outline" className="mb-2">
            {t('badge')}
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight truncate">{chat.title}</h1>
        </div>
        <Link
          href={`/c/${chat.slug}`}
          className="text-sm text-muted-foreground hover:underline whitespace-nowrap"
        >
          {t('viewPublic')} →
        </Link>
      </header>

      <section className="grid grid-cols-2 gap-4 mb-8">
        <MetricCard label={t('totalMembers')} value={metrics.totalMembers} />
        <MetricCard label={t('activeIn7d')} value={metrics.activeIn7d} />
      </section>

      <section className="mb-8">
        <h2 className="text-sm uppercase tracking-wide text-muted-foreground mb-3">
          {t('activity30d')}
        </h2>
        <Card>
          <CardContent className="p-5">
            <ActivityChart data={daily} emptyLabel={t('noActivity')} />
          </CardContent>
        </Card>
      </section>

      <section className="mb-8">
        <h2 className="text-sm uppercase tracking-wide text-muted-foreground mb-3">
          {t('top10')}
        </h2>
        {top.length === 0 ? (
          <Card className="p-6 text-center text-muted-foreground">
            {t('noMembers')}
          </Card>
        ) : (
          <Card className="overflow-hidden">
            {top.slice(0, 10).map((m) => (
              <LeaderboardRow
                key={m.user.id}
                rank={m.rank}
                displayName={m.user.display_name}
                username={m.user.username}
                avatarUrl={m.user.avatar_url}
                score={m.score}
                messageCount={m.message_count}
                actions={
                  <IssueCertButton
                    chatSlug={chat.slug}
                    userId={m.user.id}
                    label={t('issueCert')}
                    pendingLabel={t('issuingCert')}
                  />
                }
              />
            ))}
          </Card>
        )}
      </section>

      <section>
        <h2 className="text-sm uppercase tracking-wide text-muted-foreground mb-3">
          {t('allMembers')} ({allMembers.length})
        </h2>
        <MemberSearchList
          members={allMembers}
          searchPlaceholder={t('searchPlaceholder')}
          noMatchesLabel={t('noMatches')}
        />
      </section>
    </main>
  );
}
