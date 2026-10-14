# What tools does the Shamela library MCP server expose?

> 39 read-only tools, 3 prompts and 1 resource, as returned by `tools/list` on 2026-10-14 (server version 0.2.0).
> Start with `search_library`; reach for the `shamela_*` tools when you need something it cannot do. Every search query must be in Arabic.

Three tools are Quran Gallery's own (`search_library`, `search`, `fetch`). The other 36 come from the library server and keep their own names and schemas. Your client receives the full parameter documentation for each tool in its schema; this page is a map.

Required parameters are in **bold**. `response_format` is accepted by most `shamela_*` tools and is omitted below.

## Curated tools

| Tool             | What it does                                                                                                                                                                                          | Key parameters                                                |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `search_library` | Scoped search returning cited passages: book, author, death year, printed page, verbatim Arabic, edition data, shamela.ws link. Exact phrase first, then words together; reports which pass answered. | **`query`**, **`scope`** (one of 12 names), `limit` 1–10, default 5 |
| `search`         | Whole-library search for ChatGPT deep research. Up to 10 `{id, title, url}`; `id` is `bookId:pageId`. Unscoped.                                                                                       | **`query`**                                                     |
| `fetch`          | Read one page by a `search` id. Main text and footnotes kept apart, with `metadata`.                                                                                                                  | **`id`**                                                        |

`search_library` scopes: `hadith-primary`, `tafsir-canonical`, `fiqh-hanafi`, `fiqh-maliki`, `fiqh-shafii`, `fiqh-hanbali`, `fiqh-comparative`, `aqeedah`, `hadith-sciences`, `tafsir`, `seerah`, `lugha`. Book counts per scope are in [Library coverage](./library-coverage.md).

## Searching

| Tool                     | What it does                                                                                                               | Key parameters                                                                        |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `shamela_search_pages`   | Raw page search over body (matn) and footnotes; AND-combines tokens. Runs unscoped by default and ranks by term frequency. | **`query`**, `scope`, `options` (incl. `search_in`), `exclude_*` filters, `limit` ≤100, `offset`  |
| `shamela_search_phrase`  | Consecutive-phrase or proximity search.                                                                                    | **`query`**, `mode` `phrase`\|`near`, `distance` 1–50 (default 5), `search_in`, `scope` |
| `shamela_search_exact`   | Search that honours diacritics, hamza/alef forms and digit systems.                                                        | **`query`**, **`preserve`**, `scope`                                                        |
| `shamela_search_boolean` | AND / OR / NOT in one query.                                                                                               | `all_of`, `any_of`, `none_of`, `search_in`, `scope`                                   |
| `shamela_search_titles`  | Search chapter and section headings.                                                                                       | **`query`**, `scope`, `options`                                                         |
| `shamela_search_hadith`  | Find a hadith by its wording across the hadith shelves, then resolve its cross-collection takhrij.                         | **`query`**, `max_pages_scanned` 1–50, `search_all_categories`                          |
| `shamela_search_batch`   | Up to 12 scoped searches in one call, merged and deduplicated; `scope` required on every probe.                            | **`probes`**, `max_total_passages`, `deadline_ms`                                       |
| `shamela_recon`          | Before a search: how many pages carry a word, and on which shelves.                                                        | **`root`**, `mode` `literal` (default) \| `morphological`, `scope`                      |
| `shamela_root_stats`     | How an Arabic root spreads across the library by category, century, book and author.                                       | **`root`**, `mode` (default `morphological`), `scope`                                   |

## Reading

| Tool                        | What it does                                                                | Key parameters                                              |
| --------------------------- | --------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `shamela_get_page`          | One page: body, footnotes, comment, printed-page label, chapter chain.      | **`book_id`**, **`page_id`**, `body_part`                         |
| `shamela_get_pages_range`   | Consecutive pages. Keyless cap 5, with a key 20.                            | **`book_id`**, **`start_page_id`**, `count`                       |
| `shamela_get_book_section`  | Every page under one chapter heading. Keyless cap 10 pages, with a key 100. | **`book_id`**, **`title_id`**, `max_pages`                        |
| `shamela_get_toc`           | A book's table of contents, as a subtree or as the chain containing a page. | **`book_id`**, `parent_id`, `depth` 1–5, `containing_page_id` |
| `shamela_get_book_parts`    | The volumes of a multi-volume book with their page ranges.                  | **`book_id`**                                                 |
| `shamela_get_page_services` | Quranic verses, hadith keys and isnad markers recorded on a page.           | **`book_id`**, **`page_id`**                                      |

## Citations

| Tool                           | What it does                                                                                                | Key parameters                                                                                        |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `shamela_resolve_work`         | Resolve a cited title (with optional author and edition) to one catalogue entry, or refuse.                 | **`title`**, `author`, `edition`                                                                        |
| `shamela_resolve_printed_page` | Turn a printed volume/page into the page ids that carry it.                                                 | **`book_id`**, **`page`**, `part`                                                                           |
| `shamela_get_citation`         | Format a citation.                                                                                          | **`book_id`**, `page_id`, `text`, `style` `shamela` (default) \| `short` \| `full` \| `bibtex` \| `ris` |
| `shamela_resolve`              | Rank book and author ids for an Arabic name fragment. Use `shamela_resolve_work` when verifying a citation. | **`query`**, `type` `any`\|`book`\|`author`                                                             |

## Isnad and narrators

| Tool                           | What it does                                                                                                | Key parameters                                             |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `shamela_search_narrators`     | Find a narrator (راوٍ) by name among 18,989 narrators, death years 2–774 AH.                                | **`query`**, `limit` ≤50                                     |
| `shamela_get_narrator`         | A narrator's dossier: lineage, death year, ṭabaqa, grades, and critics' verdicts quoted with book and page. | **`narrator_id`**, `include_network`, `top_n`                |
| `shamela_search_isnad`         | Search 45,220 isnad chains across ten hadith books by narrators contained or a transmission sequence.       | `contains`, `transmission`, `scope_book_ids`               |
| `shamela_get_isnad`            | The chain(s) on one page with names resolved, plus other routes of the same hadith.                         | **`book_id`**, **`page_id`**, `include_variants`, `max_variants` |
| `shamela_get_books_for_hadith` | Every book citing a hadith, by Shamela's shared hadith key.                                                 | **`hadith_key`**, `downloaded_only`                          |

## Quran and tafsir

| Tool                           | What it does                                                               | Key parameters                                                         |
| ------------------------------ | -------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `shamela_search_quran`         | Search the 6,236 verses (Hafs from Asim).                                  | **`query`**, `options`                                                   |
| `shamela_get_aya`              | Fetch verses by `aya_id` (1–6236) or by surah + ayah, in three renderings. | `aya_id` or `surah` + `aya`, `count` ≤20                               |
| `shamela_get_tafseer_of_aya`   | List tafsir books with a page on this verse.                               | `aya_id` or `surah` + `aya`, `downloaded_only`                         |
| `shamela_list_tafsirs_for_aya` | Per-verse tafsir coverage report.                                          | `aya_id` or `surah` + `aya`                                            |
| `shamela_get_tafseer_texts`    | The commentary texts for one verse across several tafsirs in one call.     | `aya_id` or `surah` + `aya`, `book_ids`, `max_sources` ≤10 (default 5) |

## Catalogue

| Tool                      | What it does                                                                                  | Key parameters                                                        |
| ------------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `shamela_search_books`    | Find books by name, author, bibliography or editorial description.                            | **`query`**, `scope`, `options`                                         |
| `shamela_search_authors`  | Find authors by name or biography.                                                            | **`query`**, `options`                                                  |
| `shamela_get_book`        | Full metadata for one book.                                                                   | **`book_id`**, `include_cover`                                          |
| `shamela_get_author`      | Metadata for one author, optionally with their books.                                         | **`author_id`**, `include_books`                                        |
| `shamela_list_categories` | All 41 categories with book counts.                                                           | `include_counts`                                                      |
| `shamela_books_by_period` | Filter the catalogue by composition year and the main author's death year (AH), AND-combined. | `composed_from`, `composed_to`, `died_from`, `died_to`, `category_id` |
| `shamela_brief`           | The library server's capabilities, limits and search pitfalls, for programmatic callers.      | none                                                                  |

## Prompts

| Prompt           | Arguments                  | What it does                                                                                                                                        |
| ---------------- | -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `takhrij_hadith` | `text` (≤2,000 characters) | Locates a hadith across the collections with each source, its isnad and printed page. Does not grade it. See [Hadith takhrij](./hadith-takhrij.md). |
| `cite_passage`   | `text` (≤2,000 characters) | Finds the book, edition and printed page of a passage and cites it with a link.                                                                     |
| `compare_tafsir` | `surah` (1–114), `ayah`    | Compares how the major tafsir works explain one ayah, each view quoted and attributed.                                                              |

## Resource

| URI                              | Type            | Content                                                                                              |
| -------------------------------- | --------------- | ---------------------------------------------------------------------------------------------------- |
| `qurangallery://grounding-rules` | `text/markdown` | Grounding and citation rules. See [Search and citations](./search-and-citations.md#grounding-rules). |

## Not exposed

Three library-server tools are withheld because they describe the host machine, not the library: `shamela_list_downloaded_books`, `shamela_health` and `shamela_guide` (the desktop-extension guide). Use `shamela_search_books` to read the catalogue. Nothing about the corpus is withheld.

## Check the list yourself

```bash
curl -s https://qurangallery.com/mcp/shamela \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' \
  | python3 -c 'import json,sys; t=json.load(sys.stdin)["result"]["tools"]; print(len(t)); [print(x["name"]) for x in t]'
```

## Limitations

- All tools are read-only.
- Unscoped raw search ranks by term frequency, not scholarly authority. Unscoped, `التيمم` returns 26,098 hits topped by a 710 AH poetry anthology. Pass a scope, or use `search_library`.
- Some clients cap the total number of tools they load; this server has 39.

## Related

- [Search and citations](./search-and-citations.md)
- [Verify a quotation](./verify-a-quotation.md)
- [Rate limits and errors](./rate-limits.md)

Canonical guide: [MCP tools for classical Arabic books: the full list](https://qurangallery.com/docs/mcp/tools)

---

Last reviewed: 2026-10-14
