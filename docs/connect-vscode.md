# How do I add the Islamic library MCP server to VS Code?

> Add `https://qurangallery.com/mcp/shamela` as an `http` server in `.vscode/mcp.json`, start it, and use it from chat in agent mode.
> No account, no sign-in and no key; the server is free and run by Quran Gallery.

## Configuration

Create `.vscode/mcp.json` in your workspace:

```json
{
  "servers": {
    "quran-gallery": { "type": "http", "url": "https://qurangallery.com/mcp/shamela" }
  }
}
```

Note the shape: VS Code uses a `servers` key and an explicit `"type": "http"`, not the `mcpServers` key other clients use.

Alternatively, run **MCP: Add Server** from the Command Palette, choose the HTTP type and paste the URL.

## Steps

1. Save the file. VS Code shows a **Start** action above the server entry.
2. Start the server and trust it when asked.
3. Open the chat view in agent mode and check that `quran-gallery` appears in the tools list.
4. Ask a question that needs a text.

The Quran Gallery MCP page also has a one-click VS Code install button. For GitHub Copilot specifics, see [Connect GitHub Copilot](./connect-copilot.md).

## First prompt

```text
Find the hadith «إنما الأعمال بالنيات» in the primary collections and tell me
which book, edition, volume and page it is printed on. Quote the Arabic exactly.
```

Expected: a hit in صحيح البخاري, ط السلطانية (Sahih al-Bukhari, Sultaniyya edition) at printed page `1/ 6`, linked to `https://shamela.ws/book/1681/10`.

## Optional: a free key

A key is never required. A free key raises the limit from 10 to 60 tool calls a minute and lifts the keyless page-range caps. Create one on the **Developers** page of your Quran Gallery account:

```json
{
  "servers": {
    "quran-gallery": {
      "type": "http",
      "url": "https://qurangallery.com/mcp/shamela",
      "headers": { "Authorization": "Bearer qg_sk_your_key_here" }
    }
  }
}
```

Do not commit a workspace file that contains a key.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| 429, "Keyless limit reached" | 10 tool calls a minute and 200 a day per IP. Wait for `Retry-After`, or add a key. |
| 503 | Briefly unavailable. Retry after `Retry-After`; if zero tools are listed, wait a minute and reconnect. |
| Tools missing | Use the inline **Restart** action in `mcp.json`, or run **MCP: List Servers** and restart the server. |
| Connection fails immediately | The endpoint is `/mcp/shamela`; the bare `/mcp` is a web page. |

## Limitations

- Library queries must contain Arabic words; the agent translates English terms first. See [Search and citations](./search-and-citations.md).

## Related

- [Connect GitHub Copilot](./connect-copilot.md)
- [Connect Cursor](./connect-cursor.md)
- [Tools reference](./tools.md)

Canonical guide: [Connect VS Code to the Islamic library](https://qurangallery.com/docs/mcp/vscode)

---
Last reviewed: 2026-10-14
