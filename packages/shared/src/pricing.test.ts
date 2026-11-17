import { describe, expect, it } from 'vitest';
import { basePrice, tierForBaseStatTotal } from './pricing';

describe('catalog pricing', () => {
  it.each([
    [0, 'C'],
    [399, 'C'],
    [400, 'B'],
    [499, 'B'],
    [500, 'A'],
    [599, 'A'],
    [600, 'S'],
  ] as const)('assigns total %i to tier %s', (total, tier) => {
    expect(tierForBaseStatTotal(total)).toBe(tier);
  });
  it.each([
    [399, 'C', 399],
    [400, 'B', 500],
    [500, 'A', 700],
    [600, 'S', 1000],
  ] as const)('prices %i in tier %s at %i', (total, tier, expected) => {
    expect(basePrice(total, tier)).toBe(expected);
    expect(basePrice(total, tier)).toBe(expected);
  });
  it('rejects invalid totals', () => {
    expect(() => basePrice(-1, 'C')).toThrow(RangeError);
    expect(() => tierForBaseStatTotal(1.5)).toThrow(RangeError);
  });
});
