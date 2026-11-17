import 'reflect-metadata';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { CatalogUnitSchema } from '@pfl/shared';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';
import { sampleUnit } from '../src/sample-unit';

describe('GET /v1/health', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns 200 { status: "ok" }', async () => {
    const res = await request(app.getHttpServer()).get('/v1/health').expect(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('serves Swagger UI at /docs', async () => {
    await request(app.getHttpServer()).get('/docs').expect(200);
  });

  it('uses a sample unit that satisfies the shared schema', () => {
    expect(CatalogUnitSchema.parse(sampleUnit)).toEqual(sampleUnit);
  });
});
