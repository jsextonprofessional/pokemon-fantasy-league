import type { CatalogUnit } from '@pfl/shared';

const placeholder: CatalogUnit = {
  id: 'sample',
  speciesKey: 'sample',
  name: 'Sample Unit',
  types: ['Normal'],
  baseStats: { hp: 1, atk: 1, def: 1, spa: 1, spd: 1, spe: 1 },
  tier: 'C',
  basePrice: 6,
  createdAt: '2020-01-01T00:00:00.000Z',
  updatedAt: '2020-01-01T00:00:00.000Z',
};

export default function HomePage() {
  return (
    <main>
      <h1>Fantasy League</h1>
      <p>Placeholder home page. Sample unit: {placeholder.name}</p>
    </main>
  );
}
