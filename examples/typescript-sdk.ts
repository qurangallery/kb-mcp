// Minimal TypeScript client for the Quran Gallery MCP server (no key needed).
// Maintained version and notes: https://qurangallery.com/docs/mcp/connect-any-mcp-client
//
// Run on 2026-11-01 with @modelcontextprotocol/sdk 1.x (npm i @modelcontextprotocol/sdk@1 tsx),
// then: npx tsx typescript-sdk.ts
// It uses top-level await, so the project needs "type": "module" in package.json
// (or rename the file to typescript-sdk.mts).
//
// Optional key: set QG_API_KEY to send it as a bearer token (higher limits).
// Never put a real key in source code.
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

const url = new URL('https://qurangallery.com/mcp/shamela');
const key = process.env.QG_API_KEY;
const transport = new StreamableHTTPClientTransport(
	url,
	key ? { requestInit: { headers: { Authorization: `Bearer ${key}` } } } : undefined
);

const client = new Client({ name: 'example', version: '1.0.0' });
await client.connect(transport);

const { tools } = await client.listTools();
console.log(tools.length, 'tools');

const result = await client.callTool({
	name: 'shamela_search_library',
	arguments: { query: 'إنما الأعمال بالنيات', scope: 'hadith-primary', limit: 3 }
});
const passages = (result.structuredContent as { passages?: Array<Record<string, string>> })
	?.passages;
for (const p of passages ?? []) console.log(p.book, p.printedPage, p.matchedIn);

await client.close();
