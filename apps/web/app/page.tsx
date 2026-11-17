import type { CatalogUnit } from '@pfl/shared';

const placeholder: CatalogUnit = { id: 'sample', name: 'Sample Unit', price: 100, tags: [] };

export default function HomePage() {
  return (
    <main>
      <h1>Fantasy League</h1>
      <p>Placeholder home page. Sample unit: {placeholder.name}</p>
    </main>
  );
}
