import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { LeaderboardRow } from '@/components/leaderboard-row';
import { getChatBySlug, getTopMembers } from '@/lib/db/queries';

// PRD: refresh every 15 minutes.
export const revalidate = 900;

type Params = Promise<{ locale: string; slug: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { locale, slug } = await params;
  const chat = await getChatBySlug(slug);
  const t = await getTranslations({ locale, namespace: 'Chat' });
  if (!chat) {
    return { title: t('notFoundTitle') };
  }
  return {
    title: t('metaTitle', { title: chat.title }),
    description: t('metaDescription', { title: chat.title }),
  };
}

export default async function ChatLeaderboardPage({ params }: { params: Params }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const chat = await getChatBySlug(slug);
  if (!chat) notFound();

  const t = await getTranslations('Chat');
  const tCommon = await getTranslations('Common');
  const members = await getTopMembers(chat.id);

  return (
    <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-12">
      <div className="mb-8">
        <Link href="/" className="text-sm text-muted-foreground hover:underline">
          {tCommon('backHome')}
        </Link>
      </div>

      <header className="mb-6 flex items-baseline justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight truncate">{chat.title}</h1>
        <Badge variant="outline">{t('topMembers')}</Badge>
      </header>

      {members.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">{t('noActivity')}</Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="flex items-center gap-4 px-4 py-2 text-xs uppercase tracking-wide text-muted-foreground border-b bg-muted/40">
            <span className="w-8 text-right">{t('rank')}</span>
            <span className="w-9" />
            <span className="flex-1">{t('member')}</span>
            <span className="text-right">
              <div>{t('score')}</div>
              <div>{t('messages')}</div>
            </span>
          </div>
          {members.map((m) => (
            <LeaderboardRow
              key={m.user.id}
              rank={m.rank}
              displayName={m.user.display_name}
              username={m.user.username}
              avatarUrl={m.user.avatar_url}
              score={m.score}
              messageCount={m.message_count}
            />
          ))}
        </Card>
      )}
    </main>
  );
}
