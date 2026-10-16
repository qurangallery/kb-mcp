# How do I start using Quran Gallery's Shamela MCP server?

> Add one URL, `https://qurangallery.com/mcp/shamela`, to any MCP client that supports remote servers over Streamable HTTP, then ask a question that needs a classical Arabic text.
> No account, no key and no install. The server is hosted and free; an optional free key only raises the rate limits.

## What you need

Nothing but the endpoint:

```text
https://qurangallery.com/mcp/shamela
```

Behind it is the Maktabah al-Shamela (المكتبة الشاملة) library: 8,594 classical Arabic works by 3,188 authors in 41 categories. Quran Gallery runs this server; shamela.ws does not. Every tool is read-only.

Use the full path. The bare `https://qurangallery.com/mcp` is a web page about the server, not the endpoint.

## Which client or setup do I need?

| You use | What to do | Key possible? | Guide |
| --- | --- | --- | --- |
| ChatGPT (web, desktop) | Plugins → **Add → Add custom MCP server**, Authentication **No authentication** | No: the form has no header field | [Connect ChatGPT](./connect-chatgpt.md) |
| Claude.ai or Claude Desktop | Settings → Connectors → **+ Add → Add custom connector**, keep **No sign-in** | Yes, as a request header | [Connect Claude](./connect-claude.md) |
| Claude Code | `claude mcp add --transport http …` | Yes, `--header` | [Connect Claude](./connect-claude.md#claude-code) |
| Gemini CLI | `gemini mcp add --transport http …` | Yes, `--header` | [Connect Gemini CLI](./connect-gemini-cli.md) |
| Cursor | `~/.cursor/mcp.json`, `mcpServers` key | Yes, `headers` | [Connect Cursor](./connect-cursor.md) |
| VS Code | `.vscode/mcp.json`, `servers` key with `"type": "http"` | Yes, `headers` | [Connect VS Code](./connect-vscode.md) |
| GitHub Copilot in VS Code | Same file as VS Code, then **Agent** mode | Yes, `headers` | [Connect GitHub Copilot](./connect-copilot.md) |
| A client that only launches local commands (for example a `claude_desktop_config.json` entry) | Run the `mcp-remote` bridge with `npx` | Yes, `--header` | [mcp-remote](#mcp-remote-for-command-only-clients) below |
| Your own code | MCP SDK with a Streamable HTTP transport, or plain JSON-RPC over HTTPS | Yes, `Authorization` header | [Connect any MCP client](./connect-any-client.md) |

Menu names move between client releases. If yours differ, look for *connectors*, *integrations* or *MCP servers* in the client's settings.

## Copy-paste configurations

Claude Code:

```bash
claude mcp add --transport http quran-gallery https://qurangallery.com/mcp/shamela
```

Gemini CLI:

```bash
gemini mcp add --transport http quran-gallery https://qurangallery.com/mcp/shamela
```

Cursor (`~/.cursor/mcp.json`) and other clients that use the `mcpServers` shape:

```json
{
  "mcpServers": {
    "quran-gallery": { "url": "https://qurangallery.com/mcp/shamela" }
  }
}
```

VS Code and GitHub Copilot (`.vscode/mcp.json`):

```json
{
  "servers": {
    "quran-gallery": { "type": "http", "url": "https://qurangallery.com/mcp/shamela" }
  }
}
```

ChatGPT and Claude.ai have no config file; paste the URL into the form described in their guides.

### mcp-remote, for command-only clients

Some clients can start a local program but cannot connect to a URL. `mcp-remote` is a small Node.js bridge that runs locally and forwards to the remote server:

```json
{
  "mcpServers": {
    "quran-gallery": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://qurangallery.com/mcp/shamela"]
    }
  }
}
```

With a key, pass it through an environment variable so it stays out of the arguments you might share:

```json
{
  "mcpServers": {
    "quran-gallery": {
      "command": "npx",
      "args": [
        "-y", "mcp-remote", "https://qurangallery.com/mcp/shamela",
        "--header", "Authorization:${QG_AUTH_HEADER}"
      ],
      "env": { "QG_AUTH_HEADER": "Bearer qg_sk_your_key_here" }
    }
  }
}
```

The value is written without a space after the colon because some clients do not escape spaces inside `args`; `mcp-remote`'s own documentation recommends this form. Claude Desktop does not need the bridge at all: add the URL as a custom connector instead.

## Check the connection

Your client should list 14 tools, starting with `shamela_search_library`. To check without a client:

```bash
curl -s https://qurangallery.com/mcp/shamela \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' \
  | python3 -c 'import json,sys; t=json.load(sys.stdin)["result"]["tools"]; print(len(t), t[0]["name"])'
```

Expected output on 2026-10-15 (server 0.3.0): `12 shamela_search_library`. Listing tools does not use up the keyless tool-call allowance.

## First prompt

```text
Find the hadith «إنما الأعمال بالنيات» in the primary collections and tell me
which book, edition, volume and page it is printed on. Quote the Arabic exactly.
```

The assistant should call `shamela_search_library` with `scope: "hadith-primary"`. The answer should name صحيح البخاري, ط السلطانية (Sahih al-Bukhari, Sultaniyya printing), printed page `1/ 6`, main text, with the link `https://shamela.ws/book/1681/10`. If it answers from memory instead, reply: "Use the Quran Gallery library tool and quote what it returns."

Library queries must contain Arabic words. Ask in any language; the assistant translates the search terms.

## Transports: Streamable HTTP, SSE, stdio and mcp-remote

MCP clients and servers talk over a *transport*. Configuration errors usually come from choosing the wrong one.

| Term | What it is | This server |
| --- | --- | --- |
| Streamable HTTP | The current MCP transport for remote servers. The client sends each JSON-RPC message as an HTTP `POST` to one URL. Config names: `"type": "http"`, `--transport http`, `streamable-http`. | Supported. The only transport it speaks. Stateless: no `Mcp-Session-Id`, every request stands alone. |
| SSE (HTTP+SSE) | The older remote transport, which kept a `GET` event stream open for server messages. Superseded by Streamable HTTP. | Not supported. An SSE-configured client gets HTTP 405 on its first request. |
| stdio | The client starts the server as a local program and talks over standard input and output. Used by locally installed servers. | Not applicable. There is nothing to install or launch. |
| mcp-remote | A local bridge: the client launches it as a stdio program and it forwards to a remote URL. | Works. Use it only for clients that cannot connect to a URL. |

Protocol versions offered by the server on 2026-10-14: `2025-11-25` and `2025-06-18`.

## When you need a key

Without a key: 10 tool calls a minute and 200 a day per IP address, and the two page-range readers return a few pages per call. That covers trying the server and occasional lookups. A free key gives 60 tool calls a minute with no daily cap. Create it on the **Developers** page of a Quran Gallery account and send it as `Authorization: Bearer qg_sk_…`. Details, and the exact page caps, are in [Rate limits and errors](./rate-limits.md).

Never send a placeholder. Any bearer token is checked, so `Bearer qg_sk_your_key_here` returns HTTP 401. Send a real key or no header.

## Limitations

- Only Streamable HTTP. Clients limited to SSE need `mcp-remote` or a newer version.
- ChatGPT cannot send a key, so it always uses the keyless limits.
- Some clients cap the total number of tools they load across all servers; this server lists 14.
- Results are only as good as the question's Arabic search terms. See [Search and citations](./search-and-citations.md).

## Related

- [Available tools](./available-tools.md)
- [Troubleshooting](./troubleshooting.md)
- [Connect any MCP client](./connect-any-client.md)

Canonical guide: [Getting started with the Quran Gallery MCP server](https://qurangallery.com/docs/mcp/getting-started)

---

Last reviewed: 2026-10-15
