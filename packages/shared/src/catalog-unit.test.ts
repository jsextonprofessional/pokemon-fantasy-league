import { describe, expect, it } from 'vitest';
import { CatalogQuerySchema, CatalogUnitSchema } from './catalog-unit';

describe('CatalogUnitSchema', () => {
  const unit = {
    id: 'u1',
    speciesKey: 'sample',
    name: 'Sample',
    types: ['Fire'],
    baseStats: { hp: 45, atk: 49, def: 49, spa: 65, spd: 65, spe: 45 },
    tier: 'C',
    basePrice: 318,
    createdAt: '2020-01-01T00:00:00.000Z',
    updatedAt: '2020-01-01T00:00:00.000Z',
  };
  it('parses a valid unit', () => {
    expect(CatalogUnitSchema.parse(unit)).toEqual(unit);
  });
  it('rejects invalid units', () => {
    expect(CatalogUnitSchema.safeParse({ ...unit, basePrice: -1 }).success).toBe(false);
    expect(CatalogUnitSchema.safeParse({ ...unit, baseStats: {} }).success).toBe(false);
  });
  it('validates pagination without accepting empty or repeated values', () => {
    expect(CatalogQuerySchema.parse({}).limit).toBe(25);
    for (const limit of ['', '0', '101', '1.2', ['1', '2']]) {
      expect(CatalogQuerySchema.safeParse({ limit }).success).toBe(false);
    }
  });
});
