import type { DailyCount } from '@/lib/db/queries';

type Props = {
  data: DailyCount[];
  emptyLabel: string;
};

// Pure CSS bar chart — no client JS, no chart lib.
// Each day is a flex column whose bar height is proportional to count/max.
export function ActivityChart({ data, emptyLabel }: Props) {
  const max = Math.max(0, ...data.map((d) => d.count));
  if (max === 0) {
    return (
      <div className="h-40 flex items-center justify-center text-sm text-muted-foreground">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="h-40 flex items-end gap-px">
        {data.map((d) => {
          const heightPct = max === 0 ? 0 : (d.count / max) * 100;
          return (
            <div
              key={d.day}
              className="flex-1 flex flex-col items-center justify-end h-full"
              title={`${d.day}: ${d.count}`}
            >
              <div
                className="w-full bg-foreground/80 rounded-sm transition-all hover:bg-foreground"
                style={{ height: `${Math.max(heightPct, d.count > 0 ? 4 : 0)}%` }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
        <span>{data[0]?.day}</span>
        <span>{data[data.length - 1]?.day}</span>
      </div>
    </div>
  );
}
