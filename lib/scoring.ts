// MVP scoring formula (see docs/ARCHITECTURE.md):
//   score = messages*1 + reactions*2 + replies*3 - inactivity_penalty
//
// Inactivity rule: 0 for first 7 days; 1 point per day inactive after that.
// Capped so score never goes below 0.

export type ScoreInput = {
  messages: number;
  reactions: number;
  replies: number;
  /** Whole days since the user's last activity in this chat. */
  daysSinceLastActive: number;
};

const INACTIVITY_GRACE_DAYS = 7;

export function inactivityPenalty(daysSinceLastActive: number): number {
  return Math.max(0, daysSinceLastActive - INACTIVITY_GRACE_DAYS);
}

export function computeScore({
  messages,
  reactions,
  replies,
  daysSinceLastActive,
}: ScoreInput): number {
  const positive = messages * 1 + reactions * 2 + replies * 3;
  const score = positive - inactivityPenalty(daysSinceLastActive);
  return Math.max(0, score);
}
