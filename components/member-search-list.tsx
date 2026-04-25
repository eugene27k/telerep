'use client';

import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { LeaderboardRow } from '@/components/leaderboard-row';
import type { MemberRow } from '@/lib/db/queries';

type Props = {
  members: MemberRow[];
  searchPlaceholder: string;
  noMatchesLabel: string;
};

export function MemberSearchList({
  members,
  searchPlaceholder,
  noMatchesLabel,
}: Props) {
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return members;
    return members.filter((m) => {
      const name = m.user.display_name.toLowerCase();
      const username = (m.user.username ?? '').toLowerCase();
      return name.includes(needle) || username.includes(needle);
    });
  }, [members, q]);

  return (
    <div className="space-y-3">
      <Input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={searchPlaceholder}
      />
      {filtered.length === 0 ? (
        <div className="py-8 text-center text-sm text-muted-foreground">
          {noMatchesLabel}
        </div>
      ) : (
        <div className="rounded-lg border bg-card overflow-hidden">
          {filtered.map((m) => (
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
        </div>
      )}
    </div>
  );
}
