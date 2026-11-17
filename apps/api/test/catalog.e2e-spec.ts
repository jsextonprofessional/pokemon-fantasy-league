import 'reflect-metadata';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import { CatalogPageSchema } from '@pfl/shared';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';
import { CatalogService } from '../src/catalog/catalog.service';
import { seedCatalog } from '../src/catalog/seed';
import { PrismaService } from '../src/database/prisma.service';

const testUrl = process.env.TEST_DATABASE_URL;
if (!testUrl || !new URL(testUrl).pathname.endsWith('_test')) {
  throw new Error('TEST_DATABASE_URL must point to a dedicated database ending in _test');
}
if (process.env.DATABASE_URL) {
  const test = new URL(testUrl);
  const development = new URL(process.env.DATABASE_URL);
  const host = (url: URL) =>
    ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) ? 'localhost' : url.hostname;
  if (
    host(test) === host(development) &&
    (test.port || '5432') === (development.port || '5432') &&
    test.pathname === development.pathname
  ) {
    throw new Error('TEST_DATABASE_URL must not point to the development database');
  }
}
const prisma = new PrismaClient({ datasourceUrl: testUrl });

describe('catalog and seed', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .compile();
    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  it('seeds the same rows and values on repeated runs', async () => {
    const count = await seedCatalog(prisma);
    const before = await prisma.catalogUnit.findMany({ orderBy: { speciesKey: 'asc' } });
    expect(count).toBeGreaterThan(1000);
    expect(before.length).toBe(count);
    await seedCatalog(prisma);
    const after = await prisma.catalogUnit.findMany({ orderBy: { speciesKey: 'asc' } });
    expect(after).toEqual(before);
    const bulbasaur = before.find((unit) => unit.speciesKey === 'bulbasaur');
    expect(bulbasaur).toBeDefined();
    await prisma.catalogUnit.update({
      where: { speciesKey: 'bulbasaur' },
      data: { name: 'Incorrect', basePrice: 1 },
    });
    await seedCatalog(prisma);
    const restored = await prisma.catalogUnit.findUniqueOrThrow({
      where: { speciesKey: 'bulbasaur' },
    });
    expect(restored).toMatchObject({
      id: bulbasaur?.id,
      name: bulbasaur?.name,
      basePrice: bulbasaur?.basePrice,
    });
  }, 60_000);

  it('returns the shared response shape and defaults to 25', async () => {
    const res = await request(app.getHttpServer()).get('/v1/catalog').expect(200);
    const page = CatalogPageSchema.parse(res.body);
    expect(page.items).toHaveLength(25);
    expect(page.nextCursor).toBe(page.items[24].id);
    const max = await request(app.getHttpServer())
      .get('/v1/catalog')
      .query({ limit: 100 })
      .expect(200);
    expect(CatalogPageSchema.parse(max.body).items).toHaveLength(100);
  });

  it('filters by type, tier, maxPrice, and their combination', async () => {
    for (const query of [
      { type: 'Fire' },
      { tier: 'A' },
      { maxPrice: '500' },
      { type: 'Fire', tier: 'A', maxPrice: '800' },
    ]) {
      const res = await request(app.getHttpServer()).get('/v1/catalog').query(query).expect(200);
      const page = CatalogPageSchema.parse(res.body);
      expect(page.items.length).toBeGreaterThan(0);
      for (const item of page.items) {
        if (query.type) expect(item.types).toContain(query.type);
        if (query.tier) expect(item.tier).toBe(query.tier);
        if (query.maxPrice) expect(item.basePrice).toBeLessThanOrEqual(Number(query.maxPrice));
      }
    }
    const empty = await request(app.getHttpServer())
      .get('/v1/catalog')
      .query({ maxPrice: '0' })
      .expect(200);
    expect(CatalogPageSchema.parse(empty.body)).toEqual({ items: [], nextCursor: null });
  });

  it('paginates without repeating or skipping filtered rows', async () => {
    const expected = await prisma.catalogUnit.findMany({
      where: { types: { has: 'Fire' }, tier: 'S' },
      orderBy: { speciesKey: 'asc' },
      select: { id: true },
    });
    const ids: string[] = [];
    let cursor: string | null = null;
    do {
      const res = await request(app.getHttpServer())
        .get('/v1/catalog')
        .query({ type: 'Fire', tier: 'S', limit: '7', ...(cursor && { cursor }) })
        .expect(200);
      const page = CatalogPageSchema.parse(res.body);
      ids.push(...page.items.map((item) => item.id));
      cursor = page.nextCursor;
      expect(ids.length).toBeLessThanOrEqual(expected.length);
    } while (cursor);
    expect(ids).toEqual(expected.map((unit) => unit.id));
    expect(ids.length).toBeGreaterThan(7);
  });

  it('rejects a cursor outside the requested filters', async () => {
    const unit = await prisma.catalogUnit.findFirstOrThrow({
      where: { NOT: { types: { has: 'Fire' } } },
    });
    const res = await request(app.getHttpServer())
      .get('/v1/catalog')
      .query({ type: 'Fire', cursor: unit.id })
      .expect(400);
    expect(res.headers['content-type']).toMatch(/^application\/problem\+json/);
    expect(res.body.code).toBe('BAD_REQUEST');
  });

  it.each([
    'limit=0',
    'limit=101',
    'limit=1.5',
    'limit=',
    'limit=1&limit=2',
    'maxPrice=-1',
    'maxPrice=2147483648',
    'tier=unknown',
    'type=unknown',
    'cursor=missing',
    'unexpected=1',
  ])('returns a problem response for invalid query %s', async (query) => {
    const res = await request(app.getHttpServer()).get(`/v1/catalog?${query}`).expect(400);
    expect(res.headers['content-type']).toMatch(/^application\/problem\+json/);
    expect(res.body).toMatchObject({
      type: 'about:blank',
      status: 400,
      code: 'BAD_REQUEST',
      instance: '/v1/catalog',
    });
    expect(res.body.detail).toEqual(expect.any(String));
    expect(res.body.detail.length).toBeGreaterThan(0);
  });

  it('does not expose internal failures in problem responses', async () => {
    const spy = vi
      .spyOn(app.get(CatalogService), 'list')
      .mockRejectedValueOnce(new Error('secret'));
    try {
      const res = await request(app.getHttpServer()).get('/v1/catalog').expect(500);
      expect(res.headers['content-type']).toMatch(/^application\/problem\+json/);
      expect(res.body).toMatchObject({
        status: 500,
        code: 'INTERNAL_ERROR',
        detail: 'An internal server error occurred',
      });
      expect(JSON.stringify(res.body)).not.toContain('secret');
    } finally {
      spy.mockRestore();
    }
  });
});
