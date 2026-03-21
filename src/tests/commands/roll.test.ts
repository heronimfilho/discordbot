import { describe, it, expect } from 'vitest';
import { parseDiceNotation, rollDice } from '../../commands/utility/roll';

describe('parseDiceNotation', () => {
  it('parses simple notation: 2d6', () => {
    expect(parseDiceNotation('2d6')).toEqual({ count: 2, sides: 6, modifier: 0 });
  });

  it('parses with positive modifier: 1d20+5', () => {
    expect(parseDiceNotation('1d20+5')).toEqual({ count: 1, sides: 20, modifier: 5 });
  });

  it('parses with negative modifier: 2d8-3', () => {
    expect(parseDiceNotation('2d8-3')).toEqual({ count: 2, sides: 8, modifier: -3 });
  });

  it('parses shorthand without count: d6', () => {
    expect(parseDiceNotation('d6')).toEqual({ count: 1, sides: 6, modifier: 0 });
  });

  it('returns null for invalid notation', () => {
    expect(parseDiceNotation('abc')).toBeNull();
    expect(parseDiceNotation('2d0')).toBeNull();
    expect(parseDiceNotation('0d6')).toBeNull();
  });
});

describe('rollDice', () => {
  it('returns the correct number of rolls', () => {
    const result = rollDice({ count: 3, sides: 6, modifier: 0 });
    expect(result.rolls).toHaveLength(3);
  });

  it('each roll is within range [1, sides]', () => {
    for (let i = 0; i < 100; i++) {
      const result = rollDice({ count: 1, sides: 6, modifier: 0 });
      expect(result.rolls[0]).toBeGreaterThanOrEqual(1);
      expect(result.rolls[0]).toBeLessThanOrEqual(6);
    }
  });

  it('total includes modifier', () => {
    const result = rollDice({ count: 1, sides: 1, modifier: 5 });
    expect(result.total).toBe(6); // 1 + 5
  });
});
