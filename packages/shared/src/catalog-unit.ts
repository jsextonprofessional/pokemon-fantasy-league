import { z } from 'zod';

export const CatalogUnitSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  price: z.number().int().nonnegative(),
  tags: z.array(z.string()),
});

export type CatalogUnit = z.infer<typeof CatalogUnitSchema>;
