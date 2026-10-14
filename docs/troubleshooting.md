# Why is my MCP client failing to connect to or use the Quran Gallery MCP server?

> Most failures are a wrong URL (it must end in `/mcp/shamela`), a client set to the old SSE transport, a placeholder key header, or a query with no Arabic words.
> Find the symptom below; every message quoted here is what the live server returned on 2026-10-14 or what its documentation states.

## Quick checks

1. The URL is exactly `https://qurangallery.com/mcp/shamela`.
2. The transport is Streamable HTTP (`"type": "http"`, `--transport http`, `streamable-http`), not SSE.
3. There is either a real `qg_sk_…` key in `Authorization: Bearer …` or no `Authorization` header at all.
4. The server answers from your machine:

```bash
curl -s https://qurangallery.com/mcp/shamela \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | head -c 300
```

A body starting `{"jsonrpc":"2.0","id":1,"result":{"tools":[{"name":"search_library"` means the server is up and the problem is in the client configuration.

## Connection problems

| Symptom | Cause | Fix |
| --- | --- | --- |
| Connection fails at once, or the client reports HTTP 308 or 405 | The URL is the bare `https://qurangallery.com/mcp`. It answers `POST` with a 308 redirect to `/mcp/`, which is the web page about the server and answers `POST` with 405. Many HTTP clients also drop the request body when they follow a redirect. | Use the full endpoint `https://qurangallery.com/mcp/shamela`. |
| HTTP 405 on the first request; the client mentions SSE or an event stream | The client is configured for the older HTTP+SSE transport and opened a `GET` event stream. The server speaks Streamable HTTP only. | Set the transport to `http` or `streamable-http`. If the client only supports SSE, update it or run the `mcp-remote` bridge: see [Getting started](./getting-started.md#mcp-remote-for-command-only-clients). |
| A `GET` in a browser shows a short JSON description instead of tools | Expected. A `GET` asking for JSON returns the server's name, transport and docs link; tools are only served over `POST`. | Nothing to fix. |
| The client connects but lists zero tools | The library service behind the server is unreachable, so `tools/list` returns an empty list rather than tools that would fail. | Wait a minute, then reconnect or refresh the tool list. |
| Tools are missing or out of date after a change | Most clients read the tool list once, when the server connects. | Reconnect the server or restart the client. Per client: Claude Code `/mcp` then reconnect; Gemini CLI restart and `/mcp list`; Cursor toggle the server off and on; VS Code and Copilot **MCP: List Servers** then restart; Claude.ai **Refresh tools list**; ChatGPT **Refresh tools**, then a new conversation. |
| The client refuses to load all tools | Some clients cap the number of tools loaded across all servers. This server has 39. | Turn off servers you do not need in that client. |
| GitHub Copilot never shows the tools | Organisation policy can disable MCP servers for Copilot. | Ask the administrator whether MCP servers are allowed. |

## Authentication errors

The server never refuses a request for lacking a key. It does check any key it is sent.

| Symptom | Cause | Fix |
| --- | --- | --- |
| HTTP 401, `-32001`, "That API key is not valid." | The `Authorization` header carries a key that is wrong, deleted, or a placeholder such as `qg_sk_your_key_here`. | Put in a real key, create a new one, or remove the header to use the keyless tier. |
| HTTP 401, `-32001`, `Send Authorization: Bearer <key>, or no Authorization header at all.` | The header is `Bearer` with no key after it. | Same fix. A config template with an empty key slot breaks every request until the slot is filled or removed. |
| HTTP 403, `-32003` | The key is valid but its account is suspended. | Retrying will not help; it is an account matter. |
| HTTP 503, `-32002`, `Retry-After: 30` | The key could not be verified at that moment, so the request was refused rather than admitted. | Retry after 30 seconds. It does not mean the key is bad. |

## Rate limits

| Symptom | Cause | Fix |
| --- | --- | --- |
| HTTP 429, `-32004`, message beginning "Keyless limit reached" | No key: the limit is 10 tool calls a minute and 200 a day per IP address. Keyless callers also share a pool, so a busy moment can refuse a call before your own limit. | Wait for the `Retry-After` header, or add a free key (60 tool calls a minute, no daily cap). |
| HTTP 429 with a key | 60 tool calls a minute per key. | Wait for `Retry-After`. |
| A page-range read returns fewer pages than asked | Keyless caps: `shamela_get_pages_range` 5 pages, `shamela_get_book_section` 10. | Continue from where the response says, or use a key (20 and 100). |

The numbers and headers are in [Rate limits and errors](./rate-limits.md).

## Tool call problems

| Symptom | Cause | Fix |
| --- | --- | --- |
| Tool error: "The library is Arabic, so the query must contain Arabic words. Translate the search terms into Arabic and call again, …" | `search_library` or `search` was given English or transliterated words. | Have the assistant translate the search terms into Arabic. You can still ask in any language. |
| `BAD_ARG: Query has no searchable Arabic words.` | The same mistake on `shamela_search_phrase`. | Same fix. |
| Tool error: "scope is required and must be one of: hadith-primary, tafsir-canonical, fiqh-hanafi, …" | `search_library` was called without `scope` or with a name that does not exist. | Pick one of the 12 scopes; see [Available tools](./available-tools.md). |
| `Unrecognized key(s) in object: 'options'` | `search_in` was put in the wrong place. `shamela_search_phrase` and `shamela_search_boolean` take it at the top level; `shamela_search_pages` takes it inside `options`. | Move it to where that tool's schema expects it. Unknown arguments are rejected, not ignored. |
| Protocol error `-32601` "Unsupported method" or an unknown tool | The method or tool name does not exist. Names such as `search_classical_texts`, `get_book_page` or `get_tafsir` are not tools on this server. | Use names from `tools/list`. |
| Protocol error `-32601` saying the library is temporarily unreachable (HTTP 200) | The library service was down when the call was made. | Wait a minute and retry. |
| HTTP 400, `-32700`, "Invalid JSON." | The body is not valid JSON. | Fix the request; retrying it unchanged fails again. |
| HTTP 400, `-32600`, "Expected a JSON-RPC 2.0 request." | The body is a JSON array (a batch) or lacks `jsonrpc: "2.0"` or `method`. | Send one request per `POST`. |
| HTTP 500, `-32603` | An unexpected fault on the server. | Retry once after a few seconds. |
| HTTP 502 or 504 | From the proxy in front of the server while it restarts or is unreachable, not from the server itself. | Treat like 500. |

## The search found nothing, or found the wrong thing

- **`relaxedToTokens: true`.** The exact phrase was not found; the pages only carry the same words separately. Do not present such a hit as a quotation.
- **Empty `passages`.** The note reads "Neither the exact phrase nor its words together appear anywhere in this scope." That is a finding about the books in that scope, not about the whole library. Try another scope, a shorter phrase, or a different spelling.
- **The words are in a footnote.** `matchedIn: "footnote"` means an editor's note on the page carries them, not the author's text.
- **The unscoped `search` or `shamela_search_pages` ranks odd books first.** Unscoped ranking is by how often the words occur, so a poetry anthology can outrank Sahih al-Bukhari. Use `search_library` with a scope.

These are covered in [Search and citations](./search-and-citations.md).

## Client-specific messages

| Client | Message | Fix |
| --- | --- | --- |
| ChatGPT | "Couldn't discover OAuth settings" | Authentication was left on **OAuth**. Change it to **No authentication**. |
| ChatGPT | "Some app settings were rejected. Check the server URL or tunnel ID, icon, and authentication settings." | Check the URL is exactly `https://qurangallery.com/mcp/shamela` (not an email redirect link such as `google.com/url?q=…`), authentication is **No authentication**, and any icon is a PNG of at least 256×256 pixels under 10 KB, or leave the icon out. |
| ChatGPT | "An app with this name already exists." | Delete the old plugin first, or choose another name. |
| ChatGPT | No Plugins page or no **Add custom MCP server** | Older accounts: **Settings → Apps & Connectors → Advanced settings → Developer mode → Create**. Work accounts may need an admin to allow custom MCP servers. |
| Gemini CLI | 400, "schema at properties.transmission.items.items must be a boolean or an object" | Came from an earlier server version and is fixed. Restart `gemini`. |
| Gemini CLI | Server shown as Disabled, or "Gemini CLI is not running in a trusted directory" | Gemini CLI disables MCP servers in an untrusted folder. Open `gemini` once in that folder and trust it, or pass `--skip-trust` in scripts and with `-p`. |
| Claude.ai | Claude answers without using the library | Check the connector is switched on for this chat and ask it to use the Quran Gallery tools. |

## Limitations

- A 503 or an empty tool list is a server-side state. From the client side the only remedy is to wait and retry.
- Client menus and messages change between releases. The client rows above reflect the client guides as of 2026-10-14.

## Related

- [Getting started](./getting-started.md)
- [Rate limits and errors](./rate-limits.md)
- [Connect any MCP client](./connect-any-client.md)

Canonical guide: [Limits and errors](https://qurangallery.com/docs/mcp/limits-and-errors)

---

Last reviewed: 2026-10-14
