import { Dex } from '@pkmn/dex';
import { Prisma, PrismaClient } from '@prisma/client';
import { BaseStatsSchema, basePrice, tierForBaseStatTotal } from '@pfl/shared';

export async function seedCatalog(prisma: PrismaClient): Promise<number> {
  const species = Dex.forGen(9)
    .species.all()
    .filter(
      (unit) =>
        unit.num > 0 &&
        unit.num <= 1025 &&
        unit.gen <= 9 &&
        (unit.isNonstandard === null || unit.isNonstandard === 'Past'),
    );
  const existing = new Map(
    (await prisma.catalogUnit.findMany()).map((unit) => [unit.speciesKey, unit]),
  );

  for (const unit of species) {
    const { hp, atk, def, spa, spd, spe } = unit.baseStats;
    const stats = { hp, atk, def, spa, spd, spe };
    const baseStats: Prisma.InputJsonValue = stats;
    const total = hp + atk + def + spa + spd + spe;
    const tier = tierForBaseStatTotal(total);
    const data = {
      name: unit.name,
      types: unit.types,
      baseStats,
      tier,
      basePrice: basePrice(total, tier),
    };
    const previous = existing.get(unit.id);
    const previousStats = BaseStatsSchema.safeParse(previous?.baseStats);
    const unchanged =
      previous &&
      previous.name === data.name &&
      JSON.stringify(previous.types) === JSON.stringify(data.types) &&
      previousStats.success &&
      Object.entries(stats).every(
        ([key, value]) => previousStats.data[key as keyof typeof stats] === value,
      ) &&
      previous.tier === data.tier &&
      previous.basePrice === data.basePrice;

    await prisma.catalogUnit.upsert({
      where: { speciesKey: unit.id },
      create: { speciesKey: unit.id, ...data },
      update: unchanged ? {} : data,
    });
  }
  return species.length;
}

if (require.main === module) {
  const prisma = new PrismaClient();
  seedCatalog(prisma)
    .then((count) => console.log(`Seeded ${count} catalog units`))
    .catch((error: unknown) => {
      console.error('Catalog seed failed:', error);
      process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
}
