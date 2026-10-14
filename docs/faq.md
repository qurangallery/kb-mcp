# Quran Gallery MCP server FAQ: Shamela, hadith, tafsir and fiqh over MCP

> Quran Gallery runs a free, hosted MCP server for the Maktabah al-Shamela library at `https://qurangallery.com/mcp/shamela`.
> No account, no key, no install: 39 read-only tools over 8,594 classical Islamic works, each hit cited by edition, volume and printed page.

## Is there an MCP server for Maktabah al-Shamela?

Yes. Quran Gallery hosts one at `https://qurangallery.com/mcp/shamela` (Streamable HTTP). It is live and open to anyone. Shamela Link and alhoqbani/shamela-mcp also serve the Shamela library; see [Islamic MCP servers compared](./comparison.md).

## Is there a hadith MCP server with printed-page citations?

Yes. `search_library` with `scope: "hadith-primary"` searches the eight primary collections, each pinned to one printing, and returns the volume and page as that printing paginates them. `shamela_search_hadith`, `shamela_get_isnad` and the `takhrij_hadith` prompt trace a hadith across collections with its chains. See [Hadith takhrij](./hadith-takhrij.md).

## Can I use it for tafsir?

Yes. The `tafsir-canonical` scope searches Ibn Kathir, al-Tabari, Ibn al-Jawzi and three more, in that order; `tafsir` covers the whole shelf (586 works). `shamela_get_tafseer_texts` returns the commentary on one verse from several tafsirs in one call, and the `compare_tafsir` prompt compares them, each view quoted and attributed.

## Can I use it for fiqh?

Yes. Scopes `fiqh-hanafi`, `fiqh-maliki`, `fiqh-shafii` and `fiqh-hanbali` cover each school with usul and general fiqh; `fiqh-comparative` (1,559 works) adds inheritance, governance and fatwa collections. The server returns the texts and never issues a ruling.

## Do I need an API key or an account?

No. A free key, sent as `Authorization: Bearer qg_sk_…`, raises the limit from 10 to 60 tool calls a minute and removes the daily cap. There is no OAuth: a client that offers it should be set to no authentication. See [Rate limits and errors](./rate-limits.md).

## Is it free?

Yes.

## How many tools does it have?

39, all read-only: `search_library`, `search` and `fetch`, plus 36 `shamela_*` library tools. Also 3 prompts (`takhrij_hadith`, `cite_passage`, `compare_tafsir`) and 1 resource (`qurangallery://grounding-rules`). See [Available tools](./available-tools.md).

## What is in the library?

8,594 works by 3,188 authors in 41 categories: Quran sciences, tafsir, hadith and its sciences, fiqh of the four schools and comparative fiqh, creed, Arabic language, history, biography and more. Twelve scopes cover 7,084 works; the raw tools reach all of them. See [Library coverage](./library-coverage.md).

## What does a result contain?

Book, author and death year (AH), verbatim Arabic, the printed volume and page (`printedPage`), whether the words are in the main text or a footnote (`matchedIn`), edition, editor and publisher when recorded, and a `sourceUrl` on shamela.ws. `relaxedToTokens` says whether the exact phrase was found. See [Search and citations](./search-and-citations.md).

## What if a book has no printed page?

7,177 of the 8,594 works match a printed edition; 1,417 are paginated by Shamela itself. For those, `shamela_resolve_printed_page` reports `citable: false`, `shamela_get_citation` reports `auto_numbered: true` and labels the citation «بترقيم الشاملة آليا», and the page is still reachable through `sourceUrl`.

## Can it check a quotation an AI gave me?

Yes, in four calls: resolve the edition, resolve the printed page, read the page, format the citation. See [Verify a quotation](./verify-a-quotation.md).

## Can I search in English?

No. The library is Arabic, so a query must contain Arabic words. A query without them is refused with a message asking for an Arabic translation, and assistants normally translate and retry.

## Does it grade hadith or give rulings?

No. It finds and cites texts. A grading in a result is quoted from the book and belongs to its author.

## Is it open source?

No. The server source is not published; this repository is documentation only. Each result links to shamela.ws so a reader can check it without trusting the server.

## Is it the official Shamela server?

No. It is run by Quran Gallery (qurangallery.com) and is not operated by or affiliated with shamela.ws. Texts and page structure come from Maktabah al-Shamela, and each passage is credited and linked back.

## Is it the same as qurangallery.app or mcp.quran.ai?

The MCP server is `https://qurangallery.com/mcp/shamela`. `qurangallery.app` is the earlier site of the same project. `mcp.quran.ai` is a separate project (Quran text, tafsir and translations), not run by Quran Gallery.

## Which clients work with it?

Any client with remote MCP support over Streamable HTTP. Setup guides:

| Client | Guide |
| --- | --- |
| Claude, Claude Desktop, Claude Code | [connect-claude.md](./connect-claude.md) |
| ChatGPT | [connect-chatgpt.md](./connect-chatgpt.md) |
| Cursor | [connect-cursor.md](./connect-cursor.md) |
| VS Code | [connect-vscode.md](./connect-vscode.md) |
| Gemini CLI | [connect-gemini-cli.md](./connect-gemini-cli.md) |
| GitHub Copilot | [connect-copilot.md](./connect-copilot.md) |
| SDKs, mcp-remote, Inspector, curl | [connect-any-client.md](./connect-any-client.md) |

## Why does my client sometimes list no tools?

When the library service behind the server is unreachable, `tools/list` returns an empty list rather than tools that would fail. Wait a minute and refresh the tool list.

## Limitations

- Answers here describe the server as measured on 2026-10-14 (version 0.2.0).

## Related

- [README](../README.md)
- [Rate limits and errors](./rate-limits.md)
- [Islamic MCP servers compared](./comparison.md)

Canonical guide: [Getting started with the Quran Gallery MCP server](https://qurangallery.com/docs/mcp/getting-started)

---
Last reviewed: 2026-10-14
