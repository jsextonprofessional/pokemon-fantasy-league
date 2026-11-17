import type { AddressInfo } from 'node:net';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createHttpServer } from './server';

describe('ping tool', () => {
  const http = createHttpServer();
  let url: URL;

  beforeAll(async () => {
    await new Promise<void>((resolve) => http.listen(0, resolve));
    url = new URL(`http://127.0.0.1:${(http.address() as AddressInfo).port}/mcp`);
  });

  afterAll(async () => {
    await new Promise((resolve) => http.close(resolve));
  });

  it('returns pong via the SDK client', async () => {
    const client = new Client({ name: 'test', version: '0.0.0' });
    await client.connect(new StreamableHTTPClientTransport(url));
    const tools = await client.listTools();
    expect(tools.tools.map((t) => t.name)).toEqual(['ping']);
    const result = await client.callTool({ name: 'ping' });
    expect(result.content).toEqual([{ type: 'text', text: 'pong' }]);
    await client.close();
  });
});
