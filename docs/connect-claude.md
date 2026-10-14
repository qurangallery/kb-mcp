# How do I add the Islamic library MCP server to Claude, Claude Desktop and Claude Code?

> Add `https://qurangallery.com/mcp/shamela` as a custom connector in Claude (claude.ai or Desktop), or run one `claude mcp add` command in Claude Code.
> No account, no sign-in and no key are needed; the server is free and run by Quran Gallery.

## Claude.ai and Claude Desktop

The steps are the same in the browser and in the desktop app.

| Step | Action                                                                                                                                                                     |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | Open **Settings → Connectors** (some versions: **Customize → Connectors**). Click **+ Add**, then **Add custom connector**.                                                |
| 2    | Name: `Quran Gallery`. URL: `https://qurangallery.com/mcp/shamela`. Click **Continue**.                                                                                    |
| 3    | Claude detects the server and selects **No sign-in** (marked _Detected_). Keep it. Leave **Request headers** empty unless you have a key. Click **Add**, then **Connect**. |
| 4    | The connector page lists 39 read-only tools, set to **Needs approval**. Keep that, or set read-only tools to **Always allow**.                                             |
| 5    | In a chat, click **+** → **Connectors** and switch **Quran Gallery** on.                                                                                                   |
| 6    | On the first tool call, click **Allow once** or **Always allow**.                                                                                                          |

Plan notes:

- Free plans can add one custom connector.
- On Team and Enterprise plans an Owner adds the connector under **Organization settings → Connectors**; each member then switches it on.

## Claude Code

```bash
claude mcp add --transport http quran-gallery https://qurangallery.com/mcp/shamela
```

The default is the local scope. Use `--scope user` for every project, or `--scope project` to share it through `.mcp.json`.

Check it:

```bash
claude mcp list          # quran-gallery should show as connected
```

Inside a session, `/mcp` shows the same status. Claude Code asks before it runs each tool for the first time.

Remove it:

```bash
claude mcp remove quran-gallery
```

## First prompt

```text
Find the hadith «إنما الأعمال بالنيات» in the primary collections and tell me
which book, edition, volume and page it is printed on. Quote the Arabic exactly.
```

Expected: a call to `search_library` (or `search` then `fetch`), with a hit in صحيح البخاري, ط السلطانية (Sahih al-Bukhari, Sultaniyya edition) at printed page `1/ 6`, linked to `https://shamela.ws/book/1681/10`. If the answer comes from memory instead, reply: "Use the Quran Gallery library tool and quote what it returns."

## Optional: a free key

A key is never required. A free key raises the limit from 10 to 60 tool calls a minute, removes the daily cap and lifts the keyless page-range caps. Create one on the **Developers** page of your Quran Gallery account; see [Rate limits and errors](./rate-limits.md).

Claude.ai / Desktop: at step 3, keep **No sign-in** and add a request header:

| Header          | Value                        |
| --------------- | ---------------------------- |
| `Authorization` | `Bearer qg_sk_your_key_here` |

If the connector already exists, remove it from its **⋮** menu and add it again with the header.

Claude Code:

```bash
claude mcp add --transport http quran-gallery \
  https://qurangallery.com/mcp/shamela \
  --header "Authorization: Bearer qg_sk_your_key_here"
```

Treat the key like a password and keep it out of git.

## Troubleshooting

| Symptom                      | Fix                                                                                                                                           |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| 429, "Keyless limit reached" | Keyless use allows 10 tool calls a minute and 200 a day per IP. Wait for `Retry-After`, or add a key.                                         |
| 503                          | The server or the library behind it is briefly unavailable. Retry after `Retry-After`. If zero tools are listed, wait a minute and refresh.   |
| Tools missing                | Claude.ai / Desktop: connector **⋮** → **Refresh tools list**, then start a new chat. Claude Code: `/mcp` and reconnect, or restart `claude`. |
| Answers without the library  | Check the connector is switched on for this chat, and ask for the Quran Gallery tools by name.                                                |
| Connection fails immediately | The endpoint is `/mcp/shamela`. The bare `/mcp` is a web page, not the server.                                                                |

## Limitations

- Library queries must contain Arabic words; the assistant translates English terms first. See [Search and citations](./search-and-citations.md).
- The library is read-only. No tool writes anything.

## Related

- [Available tools](./available-tools.md)
- [Rate limits and errors](./rate-limits.md)
- [Connect any MCP client](./connect-any-client.md)

Canonical guides: [Claude and Claude Desktop](https://qurangallery.com/docs/mcp/claude) · [Claude Code](https://qurangallery.com/docs/mcp/claude-code)

---

Last reviewed: 2026-10-14
