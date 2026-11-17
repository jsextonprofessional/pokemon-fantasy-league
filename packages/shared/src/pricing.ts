import type { CatalogTier } from './catalog-unit';

export function tierForBaseStatTotal(total: number): CatalogTier {
  if (!Number.isSafeInteger(total) || total < 0) {
    throw new RangeError('Base stat total must be a nonnegative safe integer');
  }
  if (total >= 600) return 'S';
  if (total >= 500) return 'A';
  if (total >= 400) return 'B';
  return 'C';
}

export function basePrice(baseStatTotal: number, tier: CatalogTier): number {
  if (!Number.isSafeInteger(baseStatTotal) || baseStatTotal < 0) {
    throw new RangeError('Base stat total must be a nonnegative safe integer');
  }
  const premiums = { S: 400, A: 200, B: 100, C: 0 } as const;
  const premium = premiums[tier];
  if (premium === undefined || !Number.isSafeInteger(baseStatTotal + premium)) {
    throw new RangeError('Invalid tier or base price');
  }
  return baseStatTotal + premium;
}
