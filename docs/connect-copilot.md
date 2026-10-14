# How do I use the Islamic library MCP server with GitHub Copilot?

> GitHub Copilot in VS Code reads the same `.vscode/mcp.json` as VS Code: add `https://qurangallery.com/mcp/shamela` as an `http` server and call it from Copilot's **Agent** mode.
> No account, no sign-in and no key; the server is free and run by Quran Gallery.

## Configuration

`.vscode/mcp.json` (or run **MCP: Add Server** from the Command Palette):

```json
{
  "servers": {
    "quran-gallery": { "type": "http", "url": "https://qurangallery.com/mcp/shamela" }
  }
}
```

## Steps

1. Start the server from the **Start** action above its entry and trust it.
2. Open the Copilot chat view and switch to **Agent** mode.
3. Open the tools picker and confirm the `quran-gallery` tools are ticked.
4. Ask a question that needs a text.

## First prompt

```text
Find the hadith «إنما الأعمال بالنيات» in the primary collections and tell me
which book, edition, volume and page it is printed on. Quote the Arabic exactly.
```

Expected: a hit in صحيح البخاري, ط السلطانية (Sahih al-Bukhari, Sultaniyya edition) at printed page `1/ 6`, linked to `https://shamela.ws/book/1681/10`.

## Optional: a free key

A key is never required. A free key raises the limit from 10 to 60 tool calls a minute. Add a `headers` entry exactly as in [Connect VS Code](./connect-vscode.md#optional-a-free-key).

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| Tools never appear | Organisation policy can disable MCP servers for Copilot. Ask your administrator whether MCP is allowed. |
| Tools missing | Make sure the server is ticked in the tools picker; restart it from **MCP: List Servers**. |
| 429, "Keyless limit reached" | 10 tool calls a minute and 200 a day per IP. Wait for `Retry-After`, or add a key. |
| 503 | Briefly unavailable. Retry after `Retry-After`; if zero tools are listed, wait a minute and reconnect. |
| Connection fails immediately | The endpoint is `/mcp/shamela`; the bare `/mcp` is a web page. |

## Limitations

- Copilot calls MCP tools from Agent mode.
- Library queries must contain Arabic words; Copilot translates English terms first. See [Search and citations](./search-and-citations.md).

## Related

- [Connect VS Code](./connect-vscode.md)
- [Available tools](./available-tools.md)
- [Rate limits and errors](./rate-limits.md)

Canonical guide: [GitHub Copilot in VS Code](https://qurangallery.com/docs/mcp/copilot)

---
Last reviewed: 2026-10-14
