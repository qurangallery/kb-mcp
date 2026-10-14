# How do I add the Islamic library MCP server to Gemini CLI?

> Run `gemini mcp add --transport http quran-gallery https://qurangallery.com/mcp/shamela`, or add the same URL with `"type": "http"` to `.gemini/settings.json`.
> No account, no sign-in and no key; the server is free and run by Quran Gallery.

## One command

```bash
gemini mcp add --transport http quran-gallery https://qurangallery.com/mcp/shamela
```

Run it inside your project folder. It writes the server to `.gemini/settings.json` there. Add `--scope user` to write `~/.gemini/settings.json` instead, so it works in every project.

```bash
gemini mcp list                    # quran-gallery should show as Connected
gemini mcp remove quran-gallery    # to remove it
```

Start `gemini` and ask a question that needs a text. Gemini CLI asks before each tool call the first time.

## Or edit settings.json

| File | Applies to |
| --- | --- |
| `~/.gemini/settings.json` | All projects |
| `.gemini/settings.json` | One project |

```json
{
  "mcpServers": {
    "quran-gallery": {
      "url": "https://qurangallery.com/mcp/shamela",
      "type": "http"
    }
  }
}
```

This is what the command writes. `"httpUrl": "https://qurangallery.com/mcp/shamela"` also works. Keep `"type": "http"` next to `url`: older Gemini CLI versions read a bare `url` as an SSE endpoint.

## First prompt

```text
Find the hadith «إنما الأعمال بالنيات» in the primary collections and tell me
which book, edition, volume and page it is printed on. Quote the Arabic exactly.
```

Expected: a hit in صحيح البخاري, ط السلطانية (Sahih al-Bukhari, Sultaniyya edition) at printed page `1/ 6`, linked to `https://shamela.ws/book/1681/10`.

## Optional: a free key

A key is never required. A free key raises the limit from 10 to 60 tool calls a minute and lifts the keyless page-range caps. Create one on the **Developers** page of your Quran Gallery account.

```bash
gemini mcp add --transport http quran-gallery \
  https://qurangallery.com/mcp/shamela \
  --header "Authorization: Bearer qg_sk_your_key_here"
```

`-H` is the short form of `--header`. In `settings.json`, put a `headers` object next to `url`:

```json
{
  "mcpServers": {
    "quran-gallery": {
      "url": "https://qurangallery.com/mcp/shamela",
      "type": "http",
      "headers": { "Authorization": "Bearer qg_sk_your_key_here" }
    }
  }
}
```

Keep the key out of any settings file you commit.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| 400, "schema at properties.transmission.items.items must be a boolean or an object" | An earlier server version sent a tool schema the Gemini API rejected. It is fixed; restart `gemini`. |
| Server shows as Disabled, or "Gemini CLI is not running in a trusted directory" | Gemini CLI switches off MCP servers in untrusted folders, and `gemini mcp remove` cannot find them there. Open `gemini` once in the folder and trust it. In scripts or with `-p`, pass `--skip-trust`. |
| 429, "Keyless limit reached" | 10 tool calls a minute and 200 a day per IP. Wait for `Retry-After`, or add a key. |
| 503 | Briefly unavailable. Retry after `Retry-After`; if zero tools are listed, wait a minute and reconnect. |
| Tools missing | The tool list is read at startup. Restart `gemini` and run `/mcp list`. |
| Connection fails immediately | The endpoint is `/mcp/shamela`; the bare `/mcp` is a web page. |

## Limitations

- Library queries must contain Arabic words; Gemini translates English terms first. See [Search and citations](./search-and-citations.md).

## Related

- [Connect any MCP client](./connect-any-client.md)
- [Available tools](./available-tools.md)
- [Rate limits and errors](./rate-limits.md)

Canonical guide: [Connect Gemini CLI to the Islamic library](https://qurangallery.com/docs/mcp/gemini-cli)

---
Last reviewed: 2026-10-14
