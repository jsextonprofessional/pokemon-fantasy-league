import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CatalogPageSchema, CatalogQuery } from '@pfl/shared';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: CatalogQuery) {
    const where: Prisma.CatalogUnitWhereInput = {
      ...(query.type && { types: { has: query.type } }),
      ...(query.tier && { tier: query.tier }),
      ...(query.maxPrice !== undefined && { basePrice: { lte: query.maxPrice } }),
    };

    if (query.cursor) {
      const cursor = await this.prisma.catalogUnit.findFirst({
        where: { ...where, id: query.cursor },
        select: { id: true },
      });
      if (!cursor)
        throw new BadRequestException('Cursor does not identify a unit in this result set');
    }

    const units = await this.prisma.catalogUnit.findMany({
      where,
      orderBy: { speciesKey: 'asc' },
      take: query.limit + 1,
      ...(query.cursor && { cursor: { id: query.cursor }, skip: 1 }),
    });
    const hasMore = units.length > query.limit;
    const page = units.slice(0, query.limit);
    return CatalogPageSchema.parse({
      items: page.map((unit) => ({
        ...unit,
        createdAt: unit.createdAt.toISOString(),
        updatedAt: unit.updatedAt.toISOString(),
      })),
      nextCursor: hasMore ? page[page.length - 1].id : null,
    });
  }
}
