import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from '@/i18n/navigation';

type Props = {
  rank: number;
  displayName: string;
  username: string | null;
  avatarUrl: string | null;
  score: number;
  messageCount: number;
};

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function LeaderboardRow({
  rank,
  displayName,
  username,
  avatarUrl,
  score,
  messageCount,
}: Props) {
  return (
    <div className="flex items-center gap-4 py-3 px-4 border-b last:border-b-0">
      <span className="w-8 text-right tabular-nums font-mono text-muted-foreground">
        {rank}
      </span>
      <Avatar className="h-9 w-9">
        {avatarUrl ? <AvatarImage src={avatarUrl} alt={displayName} /> : null}
        <AvatarFallback>{initials(displayName) || '?'}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">
          {username ? (
            <Link
              href={`/u/${username}`}
              className="hover:underline underline-offset-4"
            >
              {displayName}
            </Link>
          ) : (
            displayName
          )}
        </div>
        {username ? (
          <div className="text-sm text-muted-foreground truncate">@{username}</div>
        ) : null}
      </div>
      <div className="text-right">
        <div className="font-mono tabular-nums font-semibold">{score}</div>
        <div className="text-xs text-muted-foreground tabular-nums">
          {messageCount}
        </div>
      </div>
    </div>
  );
}
