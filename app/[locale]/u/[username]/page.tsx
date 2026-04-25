import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { StandingCard } from '@/components/standing-card';
import { getUserByUsername, getUserStandings } from '@/lib/db/queries';

export const revalidate = 900;

type Params = Promise<{ locale: string; username: string }>;

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export async function generateMetadata({ params }: { params: Params }) {
  const { locale, username } = await params;
  const user = await getUserByUsername(username);
  const t = await getTranslations({ locale, namespace: 'User' });
  if (!user) return { title: t('notFoundTitle') };
  return {
    title: t('metaTitle', { name: user.display_name }),
    description: t('metaDescription', { name: user.display_name }),
  };
}

export default async function UserProfilePage({ params }: { params: Params }) {
  const { locale, username } = await params;
  setRequestLocale(locale);

  const user = await getUserByUsername(username);
  if (!user) notFound();

  const t = await getTranslations('User');
  const tCommon = await getTranslations('Common');
  const tChat = await getTranslations('Chat');

  const standings = await getUserStandings(user.id);
  const totalScore = standings.reduce((s, x) => s + x.score, 0);

  return (
    <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-12">
      <div className="mb-8">
        <Link href="/" className="text-sm text-muted-foreground hover:underline">
          {tCommon('backHome')}
        </Link>
      </div>

      <Card className="mb-8">
        <CardContent className="flex items-center gap-4 p-6">
          <Avatar className="h-16 w-16">
            {user.avatar_url ? (
              <AvatarImage src={user.avatar_url} alt={user.display_name} />
            ) : null}
            <AvatarFallback className="text-lg">
              {initials(user.display_name) || '?'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold truncate">{user.display_name}</h1>
            {user.username ? (
              <div className="text-muted-foreground">@{user.username}</div>
            ) : null}
          </div>
          <div className="text-right">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              {t('totalScore')}
            </div>
            <div className="font-mono tabular-nums text-3xl font-bold">
              {totalScore}
            </div>
          </div>
        </CardContent>
      </Card>

      <h2 className="text-sm uppercase tracking-wide text-muted-foreground mb-3">
        {t('communities')}
      </h2>

      {standings.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          {t('noCommunities')}
        </Card>
      ) : (
        <div className="space-y-3">
          {standings.map((s) => (
            <StandingCard
              key={s.chat.id}
              chatTitle={s.chat.title}
              chatSlug={s.chat.slug}
              rank={s.rank}
              score={s.score}
              messageCount={s.message_count}
              messagesLabel={tChat('messages').toLowerCase()}
            />
          ))}
        </div>
      )}
    </main>
  );
}
