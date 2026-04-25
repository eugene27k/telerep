import { describe, it, expect } from 'vitest';

// Placeholder for the scoring logic that will be built in Iteration 1.
// score = messages*1 + reactions*2 + replies*3 - inactivity_penalty
function computeScore({
  messages,
  reactions,
  replies,
  inactivityPenalty,
}: {
  messages: number;
  reactions: number;
  replies: number;
  inactivityPenalty: number;
}) {
  return messages * 1 + reactions * 2 + replies * 3 - inactivityPenalty;
}

describe('computeScore', () => {
  it('returns 0 for no activity', () => {
    expect(
      computeScore({ messages: 0, reactions: 0, replies: 0, inactivityPenalty: 0 }),
    ).toBe(0);
  });

  it('weights reactions and replies higher than messages', () => {
    const msgOnly = computeScore({ messages: 3, reactions: 0, replies: 0, inactivityPenalty: 0 });
    const reactionOnly = computeScore({ messages: 0, reactions: 3, replies: 0, inactivityPenalty: 0 });
    const replyOnly = computeScore({ messages: 0, reactions: 0, replies: 3, inactivityPenalty: 0 });
    expect(reactionOnly).toBeGreaterThan(msgOnly);
    expect(replyOnly).toBeGreaterThan(reactionOnly);
  });

  it('subtracts inactivity penalty', () => {
    const score = computeScore({ messages: 10, reactions: 0, replies: 0, inactivityPenalty: 5 });
    expect(score).toBe(5);
  });
});
