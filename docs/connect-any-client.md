# How do I connect any MCP client to the Shamela library server?

> Point any Streamable HTTP MCP client at `https://qurangallery.com/mcp/shamela`. It is a stateless remote endpoint: POST JSON-RPC, no session id, no key required.
> Clients that only launch local programs can reach it through `mcp-remote`.

## Endpoint facts

| Property | Value |
| --- | --- |
| URL | `https://qurangallery.com/mcp/shamela` |
| Transport | Streamable HTTP. Every message is a `POST` with a JSON-RPC body |
| Not supported | Old HTTP+SSE transport, stdio, `GET` event streams (`GET` with `Accept: text/event-stream` returns 405) |
| State | None. No `Mcp-Session-Id` is issued; each request stands alone |
| Replies | One JSON object, `Content-Type: application/json` |
| Protocol versions | `2025-11-25`, `2025-06-18` |
| Server info | `name: qurangallery-shamela`, `version: 0.2.0` (live on 2026-10-14) |
| Capabilities | 39 tools, 3 prompts, 1 resource |
| Authentication | None. Optional `Authorization: Bearer qg_sk_…` raises limits |
| CORS | `Access-Control-Allow-Origin: *` |

A `GET` with `Accept: application/json` returns a short JSON description of the endpoint, useful to confirm the URL. A notification such as `notifications/initialized` gets HTTP 202 with an empty body.

## Three setup traps

1. **Use the full path.** `/mcp` is a web page. A `POST` there is redirected (308) to `/mcp/`, which answers 405 or HTML. The server is at `/mcp/shamela`.
2. **No placeholder `Authorization` header.** Any bearer token is checked. `Bearer qg_sk_your_key_here`, or `Bearer` with nothing after it (an unset variable in a header template), returns HTTP 401 with `-32001` "That API key is not valid." Send a real key or no header. A completely empty header is ignored.
3. **Use Streamable HTTP, not SSE.** An SSE-configured client gets 405 on its first request. Switch it to `http` / `streamable-http`, or put `mcp-remote` in front of it.

## TypeScript SDK

With `@modelcontextprotocol/sdk`:

```typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

const client = new Client({ name: 'example', version: '1.0.0' });
await client.connect(
  new StreamableHTTPClientTransport(new URL('https://qurangallery.com/mcp/shamela'))
);

const { tools } = await client.listTools();
console.log(tools.length, tools[0].name); // 39 search_library

const result = await client.callTool({
  name: 'search_library',
  arguments: { query: 'إنما الأعمال بالنيات', scope: 'hadith-primary' }
});
const hit = result.structuredContent.passages[0];
console.log(hit.book, hit.printedPage, hit.matchedIn, hit.sourceUrl);
await client.close();
```

`search_library` returns its result as `structuredContent` (`passages`, `scope`, `booksSearched`, `totalMatches`, …) as well as text content. To send a key:

```typescript
new StreamableHTTPClientTransport(url, {
  requestInit: { headers: { Authorization: 'Bearer qg_sk_your_key_here' } }
});
```

## mcp-remote, for clients that only run local commands

```json
{
  "mcpServers": {
    "qurangallery-shamela": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://qurangallery.com/mcp/shamela"]
    }
  }
}
```

Requires Node.js. Claude Desktop does not need this; it can add the URL as a custom connector ([Connect Claude](./connect-claude.md)).

## MCP Inspector

```bash
npx @modelcontextprotocol/inspector --cli https://qurangallery.com/mcp/shamela \
  --transport http --method tools/list
```

For the web interface, run `npx @modelcontextprotocol/inspector`, choose **Streamable HTTP** and paste the URL.

## curl

No handshake is required. Send JSON-RPC with both content types in `Accept`:

```bash
curl -s https://qurangallery.com/mcp/shamela \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

A tool call:

```bash
curl -s https://qurangallery.com/mcp/shamela \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"search_library","arguments":{"query":"إنما الأعمال بالنيات","scope":"hadith-primary"}}}'
```

## Python (standard library)

```python
import json, urllib.request

def call(method, params=None, id=1):
    req = urllib.request.Request(
        'https://qurangallery.com/mcp/shamela',
        data=json.dumps({'jsonrpc': '2.0', 'id': id, 'method': method, 'params': params or {}}).encode(),
        headers={'Content-Type': 'application/json', 'Accept': 'application/json, text/event-stream'},
    )
    return json.load(urllib.request.urlopen(req))

tools = call('tools/list')['result']['tools']
hit = call('tools/call', {
    'name': 'search_library',
    'arguments': {'query': 'إنما الأعمال بالنيات', 'scope': 'hadith-primary'},
})['result']['structuredContent']['passages'][0]
print(len(tools), hit['book'], hit['printedPage'], hit['matchedIn'])
```

## Connected but no tools?

- The URL ends in `/mcp/shamela`.
- The client uses Streamable HTTP, not SSE.
- The tool list was requested after connecting; most clients have a refresh action.
- The `Authorization` header is a real key or absent.
- The library behind the server may be briefly unreachable. `tools/list` then returns an empty list with HTTP 200 rather than tools that would fail. Wait a minute and reconnect.
- Some clients cap the number of tools loaded across all servers. This server has 39; turn off servers you do not need.

## Limitations

- Keyless: 10 tool calls a minute and 200 a day per IP. Connecting and listing are not tool calls; keyless they share a flood ceiling of 60 requests a minute per IP. Details in [Limits and errors](./limits-and-errors.md).
- With a key, a 503 with `-32002` and `Retry-After: 30` means the key service could not be reached; retry rather than treating the key as bad.

## Related

- [Tools reference](./tools.md)
- [Search and citations](./search-and-citations.md)
- [Limits and errors](./limits-and-errors.md)

Canonical guide: [Getting started with the Quran Gallery MCP server](https://qurangallery.com/docs/mcp/getting-started)

---
Last reviewed: 2026-10-14
