import { describe, expect, it } from 'vitest';
import { CatalogUnitSchema } from './catalog-unit';

describe('CatalogUnitSchema', () => {
  it('parses a valid unit', () => {
    const unit = { id: 'u1', name: 'Sample', price: 100, tags: ['a'] };
    expect(CatalogUnitSchema.parse(unit)).toEqual(unit);
  });

  it('rejects invalid units', () => {
    expect(CatalogUnitSchema.safeParse({ id: 'u1', name: 'Sample' }).success).toBe(false);
    expect(
      CatalogUnitSchema.safeParse({ id: 'u1', name: 'Sample', price: -1, tags: [] }).success,
    ).toBe(false);
  });
});
