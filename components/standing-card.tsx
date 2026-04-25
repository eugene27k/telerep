import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from '@/i18n/navigation';

type Props = {
  chatTitle: string;
  chatSlug: string;
  rank: number;
  score: number;
  messageCount: number;
  messagesLabel: string;
};

export function StandingCard({
  chatTitle,
  chatSlug,
  rank,
  score,
  messageCount,
  messagesLabel,
}: Props) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-4">
        <div className="min-w-0">
          <Link
            href={`/c/${chatSlug}`}
            className="font-medium truncate block hover:underline underline-offset-4"
          >
            {chatTitle}
          </Link>
          <div className="text-sm text-muted-foreground tabular-nums">
            {messageCount} {messagesLabel}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="font-mono">
            #{rank}
          </Badge>
          <div className="font-mono tabular-nums font-semibold text-lg">
            {score}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
