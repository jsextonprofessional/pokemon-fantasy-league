import { createServer, type Server as HttpServer } from 'node:http';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';

export function createMcpServer(): McpServer {
  const server = new McpServer({ name: 'fantasy-league-mcp', version: '0.0.0' });
  server.registerTool(
    'ping',
    {
      description:
        'Health-check placeholder. Call to verify the MCP server is reachable; takes no input and returns "pong". Has no side effects.',
    },
    async () => ({ content: [{ type: 'text', text: 'pong' }] }),
  );
  return server;
}

// Stateless streamable HTTP: a fresh server + transport per request.
export function createHttpServer(): HttpServer {
  return createServer((req, res) => {
    if (req.url !== '/mcp' || req.method !== 'POST') {
      res.writeHead(req.url === '/mcp' ? 405 : 404).end();
      return;
    }
    const server = createMcpServer();
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    });
    res.on('close', () => {
      void transport.close();
      void server.close();
    });
    server
      .connect(transport)
      .then(() => transport.handleRequest(req, res))
      .catch(() => {
        if (!res.headersSent) res.writeHead(500).end();
      });
  });
}
