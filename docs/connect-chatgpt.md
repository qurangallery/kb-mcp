# How do I add the Islamic library MCP server to ChatGPT?

> In ChatGPT, add `https://qurangallery.com/mcp/shamela` as a custom MCP server and set Authentication to **No authentication**.
> No account, no sign-in and no key; it worked on a Free ChatGPT account in October 2026.

On a Business or Enterprise workspace, an admin may have to allow custom MCP servers first.

## Setup

1. Open `chatgpt.com/plugins`. At the top right, click **Add** → **Add custom MCP server**.
2. Fill in the form:

   | Field                  | Value                                                               |
   | ---------------------- | ------------------------------------------------------------------- |
   | Icon (optional)        | A PNG of at least 256×256 pixels and under 10 KB, or leave it empty |
   | Name                   | `Quran Gallery`                                                     |
   | Description (optional) | `Search classical Arabic Islamic books with printed-page citations` |
   | Connection             | **Server URL**: `https://qurangallery.com/mcp/shamela`              |
   | Authentication         | **No authentication**                                               |

3. Tick **I understand and want to continue**, then click **Create as a plugin**.
4. Click **Connect**. ChatGPT confirms _Quran Gallery is now connected_.
5. In a new chat, click **+** in the message box, pick **Quran Gallery**, and ask your question.

The Authentication field starts on **OAuth**. Change it: with OAuth, ChatGPT stops with "Couldn't discover OAuth settings", because this server has no sign-in.

Type or copy the URL directly. A link copied from an email may be a `google.com/url?q=…` redirect, and ChatGPT rejects it.

Older accounts without a Plugins page reach the same form through **Settings → Apps & Connectors → Advanced settings → Developer mode → Create**. Use the same URL and **No authentication**.

## Manage, refresh, remove

Open **Settings → Plugins** (`chatgpt.com/settings/plugins-settings`) and click _Quran Gallery_. Under **Manage app** you can rename it, **Refresh tools**, or **Delete app**. The server URL and icon cannot be edited; delete the plugin and add it again to change them.

## Deep research: `search` and `fetch`

ChatGPT deep research and company knowledge need two read-only tools named `search` and `fetch`. This server provides both. Every client, ChatGPT included, sees the same 14 tools, `search` and `fetch` among them.

```text
search { "query": "إنما الأعمال بالنيات" }
  → { "results": [
      { "id": "9823:66",
        "title": "شرح البخاري للسفيري = المجالس الوعظية في شرح أحاديث خير البرية — شمس الدين السفيري (1/110)",
        "url": "https://shamela.ws/book/9823/66" },
      ... up to 10 ] }

fetch { "id": "9823:66" }
  → { id, title, text, url, metadata }
```

`metadata` carries `bookId`, `pageId`, `book`, `author`, `authorDied`, `printedPage`, `edition`, `editor`, `publisher`, `hasFootnotes` and `complete`. A title ending in `[footnote match]` matched only an editor's footnote; `[token match]` means the exact phrase was not found and the words occur separately. `search` is unscoped and ranks by term frequency, so in the live result above (2026-10-14) a commentary on al-Bukhari ranks first, not the Sahih itself. For a scoped search use `shamela_search_library`; see [Search and citations](./search-and-citations.md).

## First prompt

```text
Find the hadith «إنما الأعمال بالنيات» in the primary collections and tell me
which book, edition, volume and page it is printed on. Quote the Arabic exactly.
```

Expected: a hit in صحيح البخاري, ط السلطانية (Sahih al-Bukhari, Sultaniyya edition) at printed page `1/ 6`, linked to `https://shamela.ws/book/1681/10`.

## Troubleshooting

| Message or symptom                                                                                       | Cause and fix                                                                                                                                                                                                                                                                                             |
| -------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| "Some app settings were rejected. Check the server URL or tunnel ID, icon, and authentication settings." | Check the URL is exactly `https://qurangallery.com/mcp/shamela` (not a redirect link), Authentication is **No authentication**, and the icon is a PNG ≥256×256 under 10 KB (or none). An earlier server version caused this error for everyone; it is fixed, so add the server again if you tried before. |
| "Couldn't discover OAuth settings."                                                                      | Authentication was left on OAuth. Choose **No authentication**.                                                                                                                                                                                                                                           |
| "An app with this name already exists."                                                                  | Delete the old plugin first, or use another name.                                                                                                                                                                                                                                                         |
| **Create as a plugin** does nothing                                                                      | Tick _I understand and want to continue_ first.                                                                                                                                                                                                                                                           |
| 429, "Keyless limit reached"                                                                             | 10 tool calls a minute and 200 a day per IP. Wait for `Retry-After`.                                                                                                                                                                                                                                      |
| 503                                                                                                      | Briefly unavailable. Retry after `Retry-After`; if zero tools are listed, wait a minute and **Refresh tools**.                                                                                                                                                                                            |
| Tools missing                                                                                            | ChatGPT reads the tool list when the plugin is created. **Refresh tools**, then start a new conversation.                                                                                                                                                                                                 |
| Connection fails immediately                                                                             | The endpoint is `/mcp/shamela`; the bare `/mcp` is a web page.                                                                                                                                                                                                                                            |

## Limitations

- ChatGPT's custom-server form offers only OAuth or no authentication, with no field for a bearer header. ChatGPT therefore stays on the keyless tier (10 tool calls a minute, 200 a day). To use a free key, connect from a client that can send headers; see [Rate limits and errors](./rate-limits.md).
- Library queries must contain Arabic words; ChatGPT translates English terms first.

## Related

- [Available tools](./available-tools.md)
- [Search and citations](./search-and-citations.md)
- [Connect Claude, Claude Desktop and Claude Code](./connect-claude.md)

Canonical guide: [Connect ChatGPT to the Islamic library](https://qurangallery.com/docs/mcp/chatgpt)

---

Last reviewed: 2026-10-15
