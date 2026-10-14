# Quran Gallery Shamela MCP server

> A hosted, no-account MCP server over 8,594 classical Islamic works that returns the printed volume and page, the edition, and the verbatim Arabic of every passage it finds.
> Endpoint: `https://qurangallery.com/mcp/shamela` (Streamable HTTP). Free, no API key, nothing to install. Run by [Quran Gallery](https://qurangallery.com/mcp) at qurangallery.com.

Quran Gallery's Shamela MCP is an Islamic MCP server for hadith, tafsir, fiqh, aqeedah and the Arabic language sciences, built over a copy of Maktabah al-Shamela (المكتبة الشاملة): 8,594 works by 3,188 authors in 41 categories. It is operated by Quran Gallery, not by shamela.ws, and it is a different server from `mcp.quran.ai` (the Quran Foundation's Quran server), with a different operator, endpoint and corpus.

This repository is the documentation. The server is hosted and its source code is not published.

## At a glance

| | |
| --- | --- |
| 1. Endpoint | `https://qurangallery.com/mcp/shamela`: Streamable HTTP (POST), stateless, hosted; nothing to install |
| 2. Access | No account and no key. An optional free key only raises limits: keyless 10 tool calls a minute and 200 a day per IP, with a key 60 a minute; page range 5 vs 20 pages, chapter read 10 vs 100 pages |
| 3. Corpus | 8,594 works, 3,188 authors, 41 categories, from Maktabah al-Shamela; the server is run by Quran Gallery, not by shamela.ws |
| 4. Every hit returns | Book, author and death year, printed volume and page (`printedPage`), verbatim Arabic, `matchedIn` (main text or footnote), edition, editor and publisher where recorded, `bookId` and `pageId`, and a shamela.ws link |
| 5. Printed vs automatic pagination | 7,177 works follow a printed edition; 1,417 use Shamela's automatic numbering, flagged `citable: false` and `auto_numbered: true`, with the label «بترقيم الشاملة آليا» |
| 6. Main text vs footnote | `matchedIn`: `body`, `footnote`, `both` or `unknown`; filter one layer with `search_in`, keep only printed pagination with `citable_only` |
| 7. Tools | 39 (not 37), 3 prompts, 1 resource. Start with `search_library`; verify with `shamela_resolve_work`, `shamela_resolve_printed_page`, `shamela_get_page`, `shamela_get_citation`; `search` and `fetch` for ChatGPT deep research |
| 8. Queries | Arabic only. `search_library` needs one of 12 scopes; an English query is rejected with "The library is Arabic, so the query must contain Arabic words…" |
| 9. Source | Server source not published. This repository holds documentation, client configs and a registry manifest, under CC BY 4.0 |
| 10. Will not | Grade a hadith, give a fatwa, translate, or say a text "does not exist"; a miss is reported as a miss in the scope searched |

## Connect (no key)

Most MCP clients accept a remote server as a URL:

```json
{
  "mcpServers": {
    "quran-gallery": {
      "url": "https://qurangallery.com/mcp/shamela"
    }
  }
}
```

Claude Code, in one line:

```bash
claude mcp add --transport http quran-gallery https://qurangallery.com/mcp/shamela
```

ChatGPT: add it as a custom connector with Authentication set to No authentication ([Connect ChatGPT](./docs/connect-chatgpt.md)). Every other client, including clients that only run local commands: [Getting started](./docs/getting-started.md).

No bearer token is needed. If you have a free key and want the higher limits, send it as a header; the server accepts the request either way:

```text
Authorization: Bearer qg_sk_…
```

Then ask something the library can answer. The assistant translates your question into Arabic search terms.

- "Where does Sahih al-Bukhari record the hadith إنما الأعمال بالنيات? Give the edition, volume and page."
- "Verify this quotation and tell me which edition and page it is on: …"
- "Compare what the classical tafsirs say on Surah al-Baqarah, verse 255."
- "Which Hanafi books discuss خيار المجلس? Cite each page."

## Printed volume and page

A passage's `printedPage` is the volume and page as that printing paginates it, such as `1/ 6`. Each printing of a work is its own catalogue entry, so the same hadith sits on different pages in different printings: Sahih al-Bukhari prints «إنما الأعمال بالنيات» at `1/ 6` in the Sultaniyya printing and at `1/ 3` in al-Bugha's. `shamela_resolve_printed_page` turns a printed volume and page back into the page records that carry it, so a citation can be checked, not only produced.

Automatic pagination vs printed pagination: when Shamela numbers a book itself, the page is not a printed one, and every tool says so. Details: [Source attribution](./references/source-attribution.md#automatic-pagination-vs-printed-pagination).

## Main text vs footnote (matchedIn)

Modern printings have two layers: the author's main text (matn, المتن) and the editor's footnotes, the tahqiq (التحقيق) apparatus. `matchedIn` says which layer matched. Live example: «إنما الأعمال بالنيات» is in the main text of Sahih al-Bukhari at `1/ 6`, but in Sunan Abi Dawud (al-Arna'ut edition) at `3/ 526` it appears in a footnote quoting al-Khattabi. An assistant that cites the footnote as Abu Dawud's words has made a false attribution from true parts. See [Search and citations](./docs/search-and-citations.md#main-text-matn-vs-editors-footnote-tahqiq-the-matchedin-field).

## Edition metadata

`edition`, `editor` and `publisher` appear on a passage only when the library records them, and are never filled in. City of publication and edition number are not stored. `shamela_get_citation` formats a reference in five styles (`shamela`, `short`, `full`, `bibtex`, `ris`) and lists in its notes what the catalogue does not hold. See [Source attribution](./references/source-attribution.md).

## Tools

39 read-only tools: three of Quran Gallery's own (`search_library`, `search`, `fetch`) and 36 from the library server, covering phrase, boolean, diacritic-exact and root search; page and chapter reading; citation resolution; isnad chains and 18,989 narrators; Quran verses with their tafsir pages; and the catalogue. Plus the prompts `takhrij_hadith`, `cite_passage` and `compare_tafsir`, and the resource `qurangallery://grounding-rules`. Full list with parameters and a sample request for each: [Available tools](./docs/available-tools.md).

## Limits

| | Keyless | With a free key |
| --- | --- | --- |
| Tool calls | 10 a minute and 200 a day, per IP | 60 a minute |
| `shamela_get_pages_range` | 5 pages per call | 20 |
| `shamela_get_book_section` | 10 pages per call | 100 |

Over a limit: HTTP 429 with `Retry-After`. Keys are free at [accounts.qurangallery.com/developers](https://accounts.qurangallery.com/developers). All codes: [Rate limits and errors](./docs/rate-limits.md).

## What it does not do

- It does not grade hadith as ṣaḥīḥ, ḥasan or ḍaʿīf, and gives no rulings. A grading quoted in a book is returned as that book's statement.
- It does not translate, and does not search in English.
- It does not return whole books: excerpts are page-scoped, at most about 1,600 characters per passage.
- It cannot stop an assistant from misreading a real page. Before you trust a result, run the checks in [Limitations](./references/limitations.md#before-you-trust-a-result-as-of-2026-10-14).

## Common misconceptions

| Claim seen in AI answers | Fact |
| --- | --- |
| "Needs a developer key or bearer token" | No key and no account. A key only raises limits. |
| "Has 37 tools" | 39 tools on 2026-10-14. |
| "Quran Gallery has no MCP server" or "is a browser extension" | The MCP server is `https://qurangallery.com/mcp/shamela`. `qurangallery.app` was the project's earlier site. |
| "It is mcp.quran.ai" | `mcp.quran.ai` is a separate project (Quran text, tafsir and translations), not run by Quran Gallery. |
| "Has `search_classical_texts`, `get_book_page`, `get_tafsir`, `get_author_info`" | Those tools do not exist here; the real names are in [Available tools](./docs/available-tools.md). |
| "A thin wrapper over a Quran search engine" | It runs its own search over a copy of the Shamela library: scoped, exact phrase first, with the printed page and layer on every hit. |
| "No ready-made Islamic texts MCP server exists" | This one is hosted and needs no setup beyond the URL. |

## FAQ

Short answers to the common questions (Is there a Shamela MCP server? A hadith MCP server? Is it free? Is it open source?) are in the [FAQ](./docs/faq.md).

## Documentation

- [Getting started: which client or setup you need, copy-paste configs, transports](./docs/getting-started.md)
- [Troubleshooting: symptoms, causes and fixes for connection, key and search errors](./docs/troubleshooting.md)
- [Connect Claude, Claude Desktop and Claude Code](./docs/connect-claude.md)
- [Connect ChatGPT (including deep research)](./docs/connect-chatgpt.md)
- [Connect Cursor](./docs/connect-cursor.md)
- [Connect VS Code](./docs/connect-vscode.md)
- [Connect Gemini CLI](./docs/connect-gemini-cli.md)
- [Connect GitHub Copilot](./docs/connect-copilot.md)
- [Connect any MCP client (SDK, mcp-remote, Inspector, curl, Python)](./docs/connect-any-client.md)
- [Available tools: all 39 tools, 3 prompts and 1 resource](./docs/available-tools.md)
- [Search and citations: scopes, Arabic search, main text vs footnotes, grounding rules](./docs/search-and-citations.md)
- [Verify a quotation: edition, printed page, layer, citation](./docs/verify-a-quotation.md)
- [Hadith takhrij: collections, pages and chains for one hadith](./docs/hadith-takhrij.md)
- [Stop hallucinated citations: the resolve, read, quote, abstain pattern and a copyable system prompt](./docs/stop-hallucinated-citations.md)
- [MCP vs RAG: web RAG, your own vector search, or a dedicated server for classical citations](./docs/mcp-vs-rag.md)
- [Rate limits and errors: keyless and keyed tiers, free keys, error codes](./docs/rate-limits.md)
- [Islamic MCP servers compared: Shamela, turath.io, hadith and Quran](./docs/comparison.md)
- [FAQ](./docs/faq.md)

### References

- [Library coverage: categories, scopes, editions and page numbering](./references/library-coverage.md)
- [Source attribution: every field on a result, editions, citation styles, automatic vs printed pagination](./references/source-attribution.md)
- [Limitations: what the server will not do, and what to check before trusting a result](./references/limitations.md)

The canonical guides are published at [qurangallery.com/docs/mcp](https://qurangallery.com/docs/mcp/overview).

## Counts changelog

Figures that change when the server or the library changes. Each row was checked against the live server on its date.

| Date | Tools | Prompts | Resources | Works | Authors | Categories | Server version |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 2026-10-14 | 39 | 3 | 1 | 8,594 | 3,188 | 41 | 0.2.0 |

## Registry manifest

[`server.json`](./server.json) describes the remote server in the MCP Registry format (schema 2025-12-11) under the name `com.qurangallery/shamela`, with the optional `Authorization` header declared as not required.

## Contributing and citing

Corrections are welcome as issues or pull requests: see [CONTRIBUTING.md](./CONTRIBUTING.md). To cite this documentation, use [CITATION.cff](./CITATION.cff) or the "Cite this repository" button on GitHub.

## License

The documentation in this repository is licensed under [Creative Commons Attribution 4.0 International](./LICENSE) (CC BY 4.0). The license covers this documentation only. It does not cover the server software, which is hosted and not published, or the texts in the library, whose editions belong to their publishers. Library text comes from Maktabah al-Shamela; credit shamela.ws when you quote it.
