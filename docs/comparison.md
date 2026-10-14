# Islamic MCP servers compared: Shamela, turath.io, hadith and Quran

> Three MCP servers serve the Maktabah al-Shamela library: Quran Gallery (hosted, no account), Shamela Link (hosted, free account and sign-in) and alhoqbani/shamela-mcp (local, MIT).
> Others serve turath.io, hadith-only or Quran-and-tafsir corpora. They differ in coverage, setup, and whether each hit states the printed page and the text layer.

The Maktabah al-Shamela (المكتبة الشاملة) is the classical Arabic library most of these servers draw on. Every figure for another project is that project's own published claim, re-read at its source on 2026-10-14 and linked. Two figures come from a project's own live public endpoint and say so. Star counts are from the GitHub API on the same day. Projects change; check the source before relying on a row. Where a source does not say something, the table says "not stated".

## Servers for the Shamela library

Makteb is included because it is often asked about; its page describes its own catalogue and does not mention Shamela.

| | Quran Gallery | Shamela Link | alhoqbani/shamela-mcp | Makteb |
| --- | --- | --- | --- | --- |
| Address | `https://qurangallery.com/mcp/shamela` | `https://shamela.link/mcp` | Local Claude app extension (`.mcpb`) | `https://api.makteb.org/mcp` |
| Runs | Hosted | Hosted | On your computer, against your installed Shamela 4 library | Hosted |
| Account | None; optional free key | Free account; you sign in and approve the connection | None (local) | None stated |
| Open source | No; source not published | Not stated | Yes, MIT | Not stated |
| Corpus (own claim) | 8,594 works, 3,188 authors, 41 categories | 8,598 books, 3,190 authors, 41 categories | Whatever you have installed | 48,000+ books, Sunni and Shia (own catalogue) |
| Tools | 39 | 34 | 34 (v1.3.0) | 5 |
| Clients | Any MCP client with remote-server support | Claude, ChatGPT, Hermes Agent (per its guide) | Claude app; README lists Windows 10 and 11, macOS "possible but not yet tested" | Antigravity, VS Code, Cursor, Codex and Claude, per its page |

Sources: Shamela Link [home page](https://shamela.link/en) (counts) and [guide](https://shamela.link/en/guide); [alhoqbani/shamela-mcp README](https://github.com/alhoqbani/shamela-mcp); [Makteb MCP page](https://makteb.org/mcp). The alhoqbani README itself notes that Shamela can now be reached remotely through shamela.link. alhoqbani/shamela-mcp had 103 GitHub stars.

## What a hit tells you

| | Quran Gallery | Shamela Link | alhoqbani/shamela-mcp | Makteb |
| --- | --- | --- | --- | --- |
| Printed volume and page | Yes, `printedPage` per hit; a `citable` flag says whether the numbering matches a printed edition | Yes, to book, volume and page; its guide says the citation tool flags Shamela's automatic pagination | Yes, per its README | Its page says `read_book_pages` returns volume, page and unit citations |
| Main text vs footnote | Yes, `matchedIn` on every hit, and searchable by layer | Yes, per its guide | Yes, per its README | Not stated |
| Edition, editor, publisher | When recorded; never invented | Not stated | When Shamela's database has them, per its README | Not stated |
| One-call quotation check | No; a four-call sequence ([guide](./verify-a-quotation.md)) | Yes, per its guide | Yes, `shamela_verify_quote` | Not stated |
| Link to the page on shamela.ws | Yes, `sourceUrl` | Not stated | Not stated | Not stated |

## Servers for turath.io

turath.io is a separate digital library of classical Islamic books (a Nuqayah project), not the Shamela library. These open-source wrappers are MIT licensed and run on your computer.

| Project | What it is | Stated facts |
| --- | --- | --- |
| [opin22/turath-mcp](https://github.com/opin22/turath-mcp) | MCP server over the public turath.io API | 5 tools, "8,500+ books", no key, Node.js 22 or later; 2 stars |
| [adelpro/turath-mcp](https://github.com/adelpro/turath-mcp) | MCP server via the `turath-sdk` package | 5 tools; stdio or Streamable HTTP (`npx -y turath-mcp --http`, self-hosted); 30-day response cache; 1 star |
| [mwijanarko1/nusus](https://github.com/mwijanarko1/nusus) | TypeScript SDK, CLI and optional local MCP server (`nusus-mcp`) | 5 tools (`find_books`, `find_authors`, `retrieve`, `get_context`, `get_book`), stdio, no key; its `page-id` is Turath's internal page, not the printed page; 4 stars |

## Servers for other texts

These do not cover the Shamela library.

| Server | Corpus | Stated facts |
| --- | --- | --- |
| [hadith-mcp.org](https://hadith-mcp.org) | Hadith | 6 tools; "50 000+ narrations" from the hadith-json dataset (sourced from Sunnah.com); its public collections API lists 17 collections and 50,884 hadith, from Sahih al-Bukhari and Sahih Muslim to Bulugh al-Maram; GPL-3.0; setup lists auth as none; source [ovehbe/hadith-mcp](https://github.com/ovehbe/hadith-mcp) |
| [mcp.quran.ai](https://mcp.quran.ai/documentation) | Quran with tafsir and translations | Streamable HTTP at `https://mcp.quran.ai`; "No API key is required"; its live `tools/list` returned 33 tools, including reader and settings tools; source [quran/quran-mcp](https://github.com/quran/quran-mcp) (106 stars), whose README names the QFGPL-1.0 licence |
| [tafsircenter/tafsir-mcp](https://github.com/tafsircenter/tafsir-mcp) | Quran with five classical tafsirs and word-level analysis | 13 tools; hosted at `https://mcp.tafsir.net/mcp` or installed locally (`uvx tafsir-mcp`); data reviewed by Markaz Tafsir; MIT; 72 stars |

[ragaeeb/shamela](https://github.com/ragaeeb/shamela) is a library for working with Shamela data from code (51 stars), not an MCP server. mcp.quran.ai is a separate project, not run by Quran Gallery.

## Choosing

| You want | Consider |
| --- | --- |
| Paste a URL, no account, no key, no install | Quran Gallery. Shamela Link is also hosted but needs a free account and sign-in |
| Everything local, with source you can read | alhoqbani/shamela-mcp (MIT, against your Shamela install) |
| One tool that checks a quotation | Shamela Link or alhoqbani/shamela-mcp. Quran Gallery does it in a few calls |
| A catalogue larger than Shamela, including Shia works | Makteb (48,000+ books stated) |
| A small open-source wrapper over turath.io | The turath.io projects above; read each README for what a hit returns |
| Only hadith, or only the Quran and tafsir | The specialist servers above |

## Limitations

- Quran Gallery's figures are measured on its live server. Other rows are each project's own published claims; the mcp.quran.ai tool count and the hadith-mcp collection count were read from those projects' live public endpoints. Nothing else was independently tested.
- Shamela Link's pages describe signing in and approving the connection; they do not name the authorisation protocol, so this page does not either.
- Quran Gallery does not grade hadith, issue rulings or replace a scholar. It is not open source, covers only the Shamela library, and is not a service of shamela.ws.

## Related

- [Library coverage](../references/library-coverage.md)
- [Search and citations](./search-and-citations.md)
- [FAQ](./faq.md)

Canonical guide: [Quran Gallery MCP overview](https://qurangallery.com/docs/mcp/overview)

---

Last reviewed: 2026-10-14
