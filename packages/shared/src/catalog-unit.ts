import { z } from 'zod';

export const CatalogTierSchema = z.enum(['S', 'A', 'B', 'C']);
export type CatalogTier = z.infer<typeof CatalogTierSchema>;

export const BaseStatsSchema = z.object({
  hp: z.number().int().nonnegative(),
  atk: z.number().int().nonnegative(),
  def: z.number().int().nonnegative(),
  spa: z.number().int().nonnegative(),
  spd: z.number().int().nonnegative(),
  spe: z.number().int().nonnegative(),
});

export const CatalogUnitSchema = z.object({
  id: z.string().min(1),
  speciesKey: z.string().min(1),
  name: z.string().min(1),
  types: z.array(z.string().min(1)).min(1),
  baseStats: BaseStatsSchema,
  tier: CatalogTierSchema,
  basePrice: z.number().int().nonnegative(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export type CatalogUnit = z.infer<typeof CatalogUnitSchema>;

const integerQuery = z
  .string()
  .regex(/^(0|[1-9]\d*)$/)
  .transform(Number)
  .pipe(z.number().int().max(2_147_483_647));

export const CatalogQuerySchema = z
  .object({
    type: z
      .enum([
        'Normal',
        'Fire',
        'Water',
        'Electric',
        'Grass',
        'Ice',
        'Fighting',
        'Poison',
        'Ground',
        'Flying',
        'Psychic',
        'Bug',
        'Rock',
        'Ghost',
        'Dragon',
        'Dark',
        'Steel',
        'Fairy',
      ])
      .optional(),
    tier: CatalogTierSchema.optional(),
    maxPrice: integerQuery.optional(),
    cursor: z.string().min(1).max(128).optional(),
    limit: integerQuery.pipe(z.number().int().min(1).max(100)).optional().default(25),
  })
  .strict();

export type CatalogQuery = z.infer<typeof CatalogQuerySchema>;

export const CatalogPageSchema = z.object({
  items: z.array(CatalogUnitSchema),
  nextCursor: z.string().nullable(),
});
