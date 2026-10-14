# What are the rate limits and error codes of the Quran Gallery MCP server?

> Without a key: 10 tool calls a minute and 200 a day per IP address. With a free key: 60 a minute per key and no daily cap.
> Errors are JSON-RPC errors with `id: null`; recoverable mistakes (bad scope, empty or non-Arabic query) come back as tool results marked `isError`.

## Rate limits

A key is never required. Without one you are on the keyless tier.

| | Keyless | With a free key |
| --- | --- | --- |
| Tool calls | 10 a minute and 200 a day, per IP address | 60 a minute, per key; no daily cap |
| Connecting and listing tools | Not counted; flood ceiling of 60 a minute per IP | Counted in the 60 |
| `shamela_get_pages_range` | Up to 5 pages per call | Up to 20 |
| `shamela_get_book_section` | Up to 10 pages per call | Up to 100 |

- All windows are sliding. A refused call spends nothing: hitting the per-minute limit does not use up the daily one.
- Keyless callers also share one pool of capacity, so at a busy moment a keyless call can be refused before your own limit; the message says so.
- A shortened page range is not a lost page: the response says where to continue.
- One `search_library` call is one tool call, even though it may run two search passes.

Every response carries the current state:

| Header | Meaning |
| --- | --- |
| `ratelimit-limit` | The ceiling closest to being reached |
| `ratelimit-remaining` | Requests left under that ceiling |
| `ratelimit-reset` | Seconds until its window resets |

Over a limit you get HTTP 429 with a `Retry-After` header and a message naming the limit, for example "Keyless limit reached". Wait that long, or add a key.

Check your headers:

```bash
curl -s -D - -o /dev/null https://qurangallery.com/mcp/shamela \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | grep -i '^ratelimit'
```

## A free key

1. Sign in to your Quran Gallery account and open **Developers** (`https://accounts.qurangallery.com/developers`).
2. Create a key with a descriptive name. The full key (`qg_sk_…`) is shown once; copy it then.
3. Send it as a header on every request:

```http
Authorization: Bearer qg_sk_your_key_here
```

The key goes in the `Authorization` header only. Only a hash is stored, so a lost key cannot be recovered: delete it and create another. Treat it like a password and keep it out of git.

Revocation reaches the endpoint within 60 seconds (verified keys are cached for a minute; about 6 seconds was measured). When revoking a leaked key, delete it at once and treat the next minute as still exposed.

ChatGPT's custom-server form cannot send a header, so ChatGPT always uses the keyless tier. Header setup examples: [Claude and Claude Code](./connect-claude.md#optional-a-free-key) and [the MCP SDK](./connect-any-client.md). Do not leave a placeholder header in a config: it is checked and returns 401.

## HTTP and JSON-RPC errors

A request without a key is never refused for lacking one. A key that is sent is checked, and a bad one is refused rather than silently treated as keyless. A header with a placeholder or an empty `Bearer` value counts as a bad key; a wholly empty header is ignored.

| Status | JSON-RPC code | Meaning | Action |
| --- | --- | --- | --- |
| 401 | `-32001` | A key was sent and is not valid ("That API key is not valid.") | Fix the header, create a new key, or remove the header |
| 403 | `-32003` | Valid key, but the account is suspended | Account issue; retrying will not help |
| 429 | `-32004` | A rate limit was reached; the message says which | Wait for `Retry-After` |
| 503 | `-32002` | The key could not be verified right now; refused rather than admitted | Retry after `Retry-After` (30 seconds) |
| 400 | `-32700` | Body is not valid JSON | Fix the request |
| 400 | `-32600` | JSON, but not a JSON-RPC 2.0 request (no `jsonrpc: "2.0"` or `method`, or a batch) | One request per POST; batching is not supported |
| 500 | `-32603` | Unexpected server fault | Retry once after a few seconds |
| 502, 504 | none | From the proxy in front of the server while it restarts or is unreachable | Treat like 500 |
| 405 | none | A `GET` to the endpoint (an older HTTP+SSE client opening an event stream), or a `POST` to the web page `/mcp/` | Use Streamable HTTP and `POST` to `https://qurangallery.com/mcp/shamela`; see [Troubleshooting](./troubleshooting.md#connection-problems) |
| 308 | none | A `POST` to the bare `https://qurangallery.com/mcp`, redirected to the web page `/mcp/`; many clients drop the body on redirect | Use the full endpoint `https://qurangallery.com/mcp/shamela` |

Example: a request with an invalid key returns HTTP 401 and

```json
{ "jsonrpc": "2.0", "id": null, "error": { "code": -32001, "message": "That API key is not valid." } }
```

## Tool errors and protocol errors

Once a request is accepted, a failure has one of two shapes.

| Situation | Shape |
| --- | --- |
| Missing or invalid `scope` | Tool error (`isError: true`), listing the valid scopes |
| Empty `query` | Tool error |
| Query with no Arabic words | Tool error, asking for an Arabic query |
| Library drops out during a call | Tool error |
| Library already unreachable when you call | Protocol error `-32601`, HTTP 200 |
| Unknown tool name | Protocol error `-32601` |
| Malformed JSON-RPC request | Protocol error `-32600` |

A tool error is a normal result the model can read and correct; for an invalid scope it reads: `scope is required and must be one of: hadith-primary, tafsir-canonical, fiqh-hanafi, …`. Many clients never show a protocol error to the model, which is why recoverable mistakes are returned as tool errors.

## When the library is unavailable

If the library service behind the server is unreachable, `tools/list` returns no tools rather than advertising tools that would fail, and any tool call returns `-32601` saying the library is temporarily unreachable (HTTP 200, not 503). A client that suddenly lists zero tools is showing this state: wait a minute and reconnect or refresh the tool list.

## Limitations

- Keyless limits are per IP address, so users behind one shared network share one allowance.
- Limits and caps are as measured and documented on 2026-10-14 and may change; the response headers are authoritative.

## Related

- [Connect any MCP client](./connect-any-client.md)
- [Available tools](./available-tools.md)
- [FAQ](./faq.md)

Canonical guide: [Limits and errors](https://qurangallery.com/docs/mcp/limits-and-errors)

---

Last reviewed: 2026-10-14
