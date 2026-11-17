import { createHttpServer } from './server';

const port = Number(process.env.PORT ?? 4100);
createHttpServer().listen(port, () => {
  console.log(`MCP server listening on http://localhost:${port}/mcp`);
});
