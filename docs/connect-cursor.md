# How do I add the Islamic library MCP server to Cursor?

> Add `https://qurangallery.com/mcp/shamela` under `mcpServers` in Cursor's `mcp.json`, then use it from a chat in Agent mode.
> No account, no sign-in and no key; the server is free and run by Quran Gallery.

## Configuration

| File | Applies to |
| --- | --- |
| `~/.cursor/mcp.json` | All projects |
| `.cursor/mcp.json` | This project only |

Create the file if it does not exist:

```json
{
  "mcpServers": {
    "quran-gallery": { "url": "https://qurangallery.com/mcp/shamela" }
  }
}
```

Save. Cursor lists MCP servers on its **Customize** page; `quran-gallery` should show as enabled with its tools. Open a chat in **Agent** mode and ask a question that needs a text.

The Quran Gallery MCP page also has a one-click install button for Cursor.

## First prompt

```text
Find the hadith «إنما الأعمال بالنيات» in the primary collections and tell me
which book, edition, volume and page it is printed on. Quote the Arabic exactly.
```

Expected: a hit in صحيح البخاري, ط السلطانية (Sahih al-Bukhari, Sultaniyya edition) at printed page `1/ 6`, linked to `https://shamela.ws/book/1681/10`. If the answer comes from memory, reply: "Use the Quran Gallery library tool and quote what it returns."

## Optional: a free key

A key is never required. A free key raises the limit from 10 to 60 tool calls a minute and lifts the keyless page-range caps. Create one on the **Developers** page of your Quran Gallery account and send it as a bearer token:

```json
{
  "mcpServers": {
    "quran-gallery": {
      "url": "https://qurangallery.com/mcp/shamela",
      "headers": { "Authorization": "Bearer qg_sk_your_key_here" }
    }
  }
}
```

Keep any file that holds a key out of git.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| 429, "Keyless limit reached" | 10 tool calls a minute and 200 a day per IP. Wait for `Retry-After`, or add a key. |
| 503 | Briefly unavailable. Retry after `Retry-After`; if zero tools are listed, wait a minute and reconnect. |
| Tools missing | Toggle the server off and on in Cursor's MCP list, or restart Cursor. The tool list is cached per session. |
| Connection fails immediately | The endpoint is `/mcp/shamela`; the bare `/mcp` is a web page. |

## Limitations

- Library queries must contain Arabic words; the agent translates English terms first. See [Search and citations](./search-and-citations.md).
- Some clients cap the number of tools they load across all servers. This server has 39 ([Available tools](./available-tools.md)); turn off servers you do not need.

## Related

- [Connect VS Code](./connect-vscode.md)
- [Limits and errors](./limits-and-errors.md)
- [Connect any MCP client](./connect-any-client.md)

Canonical guide: [Connect Cursor to the Islamic library](https://qurangallery.com/docs/mcp/cursor)

---
Last reviewed: 2026-10-14
