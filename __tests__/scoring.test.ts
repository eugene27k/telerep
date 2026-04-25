import { describe, it, expect } from 'vitest';
import { computeScore, inactivityPenalty } from '@/lib/scoring';

describe('inactivityPenalty', () => {
  it('is 0 within the 7-day grace window', () => {
    expect(inactivityPenalty(0)).toBe(0);
    expect(inactivityPenalty(7)).toBe(0);
  });

  it('grows by 1 per day after grace', () => {
    expect(inactivityPenalty(8)).toBe(1);
    expect(inactivityPenalty(14)).toBe(7);
    expect(inactivityPenalty(30)).toBe(23);
  });
});

describe('computeScore', () => {
  it('is 0 with no activity', () => {
    expect(
      computeScore({ messages: 0, reactions: 0, replies: 0, daysSinceLastActive: 0 }),
    ).toBe(0);
  });

  it('weights replies > reactions > messages', () => {
    const args = { reactions: 0, replies: 0, daysSinceLastActive: 0 };
    const msg = computeScore({ ...args, messages: 1 });
    const react = computeScore({ ...args, messages: 0, reactions: 1 });
    const reply = computeScore({ ...args, messages: 0, replies: 1 });
    expect(msg).toBe(1);
    expect(react).toBe(2);
    expect(reply).toBe(3);
  });

  it('combines counters additively', () => {
    expect(
      computeScore({ messages: 10, reactions: 5, replies: 2, daysSinceLastActive: 0 }),
    ).toBe(10 + 10 + 6);
  });

  it('subtracts inactivity penalty after grace', () => {
    // 10 messages = 10pts; 14 days inactive = 7pt penalty
    expect(
      computeScore({ messages: 10, reactions: 0, replies: 0, daysSinceLastActive: 14 }),
    ).toBe(3);
  });

  it('never goes below zero', () => {
    expect(
      computeScore({ messages: 1, reactions: 0, replies: 0, daysSinceLastActive: 365 }),
    ).toBe(0);
  });

  it('inactivity within grace does not reduce score', () => {
    expect(
      computeScore({ messages: 5, reactions: 0, replies: 0, daysSinceLastActive: 5 }),
    ).toBe(5);
  });
});
