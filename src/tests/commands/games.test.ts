import { describe, it, expect } from 'vitest';
import { resolveRPS, RPS_MOVES } from '../../commands/games/rps';
import { EIGHT_BALL_RESPONSES } from '../../commands/games/eightball';

describe('resolveRPS', () => {
  it('player wins with rock vs scissors', () => {
    expect(resolveRPS('rock', 'scissors')).toBe('win');
  });

  it('player loses with rock vs paper', () => {
    expect(resolveRPS('rock', 'paper')).toBe('lose');
  });

  it('draw when both pick same', () => {
    expect(resolveRPS('paper', 'paper')).toBe('draw');
  });
});

describe('RPS_MOVES', () => {
  it('has exactly 3 moves', () => {
    expect(RPS_MOVES).toHaveLength(3);
  });
});

describe('EIGHT_BALL_RESPONSES', () => {
  it('has at least 10 responses', () => {
    expect(EIGHT_BALL_RESPONSES.length).toBeGreaterThanOrEqual(10);
  });
});
