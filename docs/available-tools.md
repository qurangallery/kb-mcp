# What tools does the Shamela library MCP server expose?

> 14 read-only tools (the same for every client), 3 prompts and 1 resource, as returned by `tools/list` on 2026-10-15 (server version 0.3.0).
> Start with `shamela_search_library`, which needs an Arabic query and one of 12 scopes; reach for the `shamela_*` tools when you need something it cannot do.

Three tools are Quran Gallery's own (`shamela_search_library`, `search`, `fetch`). The other 11 come from the library server (version 1.4.0), which consolidated its 39 earlier tools into routers; the old names still work as unlisted aliases, see [Renamed and consolidated in 1.4.0](#renamed-and-consolidated-in-140). Your client receives the full parameter documentation for each tool in its schema; this page is a map with a sample request for each.

Required parameters are in **bold**. `response_format` is accepted by most `shamela_*` tools and is omitted below. The "Try asking" column is a plain-language request that should lead an assistant to call the tool.

## shamela_search_library: the scoped default

| Parameter | Type | Rules |
| --- | --- | --- |
| **`query`** | string | Arabic text. A quoted wording works best; a topic also works. A query with no Arabic words is rejected. |
| **`scope`** | string | One of the 12 scope names below. Required. |
| `limit` | integer | 1 to 10, default 5 |

It runs an exact-phrase pass first and, only if that finds nothing, a pass that looks for the same words anywhere on a page. Each response reports which pass answered (`relaxedToTokens`).

### Why scope is mandatory

The library's full-text index ranks by how often the words occur, not by how authoritative a book is. Unscoped, «التيمم» returns 26,098 hits topped by a 710 AH poetry anthology. A scope limits the search to the shelves where a reader would look first. Scope narrows which books are searched, never how the words are matched.

| If you are asking about | Scope | Books |
| --- | --- | --- |
| Whether a hadith exists, and where it is printed | `hadith-primary` | 8 (named printings) |
| What a well-known commentator said about a verse | `tafsir-canonical` | 6 |
| A ruling within one school | `fiqh-hanafi`, `fiqh-maliki`, `fiqh-shafii`, `fiqh-hanbali` | 1,034 / 1,036 / 1,037 / 1,100 |
| How the schools differ on a question | `fiqh-comparative` | 1,559 |
| A grading, a chain, or how a hadith was received | `hadith-sciences` | 1,957 |
| A point of creed | `aqeedah` | 958 |
| The whole tafsir shelf and the Quranic sciences | `tafsir` | 586 |
| An event, a life, or a narrator's biography | `seerah` | 972 |
| What an Arabic word means or how it is parsed | `lugha` | 1,052 |

The 12 scopes cover 7,084 of the 8,594 works. Qira'at, adab, genealogy and other shelves outside them are reached through `shamela_search` with `scope.category_ids`; see [Library coverage](../references/library-coverage.md).

If a scope returns nothing, try its broader neighbour (`tafsir-canonical` to `tafsir`, one school to `fiqh-comparative`) and report that the narrower shelf was silent.

### What it rejects

| Input | Error text |
| --- | --- |
| No scope, or an unknown one | `scope is required and must be one of: hadith-primary, tafsir-canonical, fiqh-hanafi, …` |
| A query with no Arabic words | `The library is Arabic, so the query must contain Arabic words. Translate the search terms into Arabic and call again, for example «إنما الأعمال بالنيات» for "actions are judged by intentions".` |

Both come back as a tool result with `isError: true`, not as a protocol error, so the assistant can correct the call and retry.

The raw `shamela_*` tools answer invalid arguments the same way: a tool result with `isError: true` whose text starts `BAD_ARG:`, names the argument and says what to send. For example, `shamela_read` with `book_id` 0 returns ``BAD_ARG: shamela_read was called with invalid arguments. `book_id` must be greater than 0. Expected a positive Shamela book id: get it from shamela_find …``, and `shamela_search` with `scope` given as a string returns ``BAD_ARG: … `scope` must be an object such as {category_ids:[16]} or {madhab:'shafii'}, not a string.``

### What each passage carries

`book`, `author`, `authorDied` (AH), `bookId`, `pageId`, `printedPage`, `arabic` (verbatim, up to 1,600 characters), `matchedIn`, `matchQuality`, `sourceUrl`, and `edition`, `editor` and `publisher` when the library records them.

`matchedIn` says where the words were found: `body` (the main text, matn / المتن), `footnote` (the editor's or commentator's note, the tahqiq layer / التحقيق), `both`, or `unknown`. A footnote hit is not the author's sentence. Field by field: [Source attribution](../references/source-attribution.md).

## Curated tools

| Tool | What it does | Key parameters | Try asking |
| --- | --- | --- | --- |
| `shamela_search_library` | Scoped search returning cited passages: book, author, death year, printed page, verbatim Arabic, `matchedIn`, edition data, shamela.ws link. | **`query`**, **`scope`**, `limit` 1–10 | "Where is «إنما الأعمال بالنيات» printed in the primary hadith collections?" |
| `search` | Whole-library search for ChatGPT deep research. Up to 10 `{id, title, url}`; `id` is `bookId:pageId`. Unscoped. | **`query`** | (deep research mode) "Research the classical sources on «التيمم»." |
| `fetch` | Read one page by a `search` id. Main text and footnotes kept apart, with `metadata`. | **`id`** | Called by deep research after `search` |

## Searching

| Tool | What it does | Key parameters | Try asking |
| --- | --- | --- | --- |
| `shamela_search` with `match: "words"` (default) | Raw page search over body (matn) and footnotes; AND-combines tokens. Runs unscoped by default and ranks by term frequency. If nothing matches and the query has six words or fewer, it retries once by Arabic root and sets `morphology_fallback: true`: the results are other word forms from the same roots, a superset of what was asked. `relaxed_min_match` / `relaxed_of_terms` mean no page held every word, so the hit matched only that many of them. | **`query`**, `scope`, `options` (incl. `search_in`), `exclude_*` filters, `limit` ≤100, `offset` | "Search the qira'at books for «الإمالة»." |
| `shamela_search` with `match: "phrase"` or `"near"` | Consecutive-phrase or proximity search. `phrase` is a true consecutive-phrase index query, so it also finds phrases made of common words; `near` finds the words within `distance` of each other. (The old tool's `mode` argument is now `match`.) | **`query`**, `distance` 1–50 (default 5), `search_in`, `scope` | "Find pages where «الصلاة» and «الوسطى» appear within three words of each other." |
| `shamela_search` with `match: "exact"` | Search that honours diacritics, hamza/alef forms and digit systems. | **`query`**, **`preserve`**, `scope` | "Find this exact vocalised spelling, diacritics included." |
| `shamela_search` with `match: "boolean"` | AND / OR / NOT in one query. | `all_of`, `any_of`, `none_of`, `search_in`, `scope` | "Pages with «الوضوء» and «النية» but not «الغسل»." |
| `shamela_search` with `match: "batch"` | Up to 24 scoped searches in one call, merged and deduplicated; `scope` required on every query. (The old `probes` argument is now `queries`; sending `queries` alone selects batch.) | **`queries`**, `max_total_passages` ≤200, `deadline_ms` ≤60000 | "Search Hanafi and Maliki fiqh for «المسح على الخفين» in one go." |
| `shamela_find` with `kind: "heading"` | Search chapter and section headings. | **`query`**, `scope`, `options` | "Which books have a chapter titled «باب التيمم»?" |
| `shamela_lookup_hadith` with `mode: "search"` (default) | Find a hadith by its wording across the hadith shelves, then resolve its cross-collection takhrij. A query of four or more words that finds nothing is retried once without one word; the response then carries `relaxed: { dropped_term, searched_query }` and the results are a near match, so say which word was dropped. | **`query`**, `max_pages_scanned` 1–50, `search_all_categories` | "Which collections narrate «إنما الأعمال بالنيات»?" |
| `shamela_survey_topic` | Before a search: statistics only, never passages. The exact total of matching pages plus their distribution by category, Hijri century, book and author. `morphological` counts every derived form of the root and is far broader than `literal`. | **`term`**, `mode` `literal` (default) \| `morphological`, `scope` | "How common is «الاستحسان», and in which categories and centuries?" |

## Reading

`shamela_read` takes `unit` to pick what to read. Send `unit` explicitly; without it the router infers the unit from the other arguments and falls back to `page`.

| Tool | What it does | Key parameters | Try asking |
| --- | --- | --- | --- |
| `shamela_read` with `unit: "page"` (default) | One page: body, footnotes, comment, printed-page label, chapter chain. | **`book_id`**, **`page_id`**, `body_part` | "Read page 10 of book 1681 in full." |
| `shamela_read` with `unit: "range"` | Consecutive pages. Keyless cap 5, with a key 20. | **`book_id`**, **`start_page_id`**, `count` | "Read the next four pages after that." |
| `shamela_read` with `unit: "section"` | Every page under one chapter heading. Keyless cap 10 pages, with a key 100. | **`book_id`**, **`title_id`**, `max_pages` | "Read the whole chapter that page sits in." |
| `shamela_read` with `unit: "toc"` | A book's table of contents, as a subtree or as the chain containing a page. | **`book_id`**, `parent_id`, `depth` 1–5, `containing_page_id` | "Show the table of contents of book 1681, two levels deep." |
| `shamela_read` with `unit: "parts"` | The volumes of a multi-volume book with their page ranges. | **`book_id`** | "How many volumes does this book have, and where does each start?" |
| `shamela_read` with `unit: "services"` | Quranic verses, hadith keys and isnad markers recorded on a page. | **`book_id`**, **`page_id`** | "Which verses and hadith are marked on this page?" |

## Citations

| Tool | What it does | Key parameters | Try asking |
| --- | --- | --- | --- |
| `shamela_find` with `kind: "work"` | Resolve a cited title (with optional author and edition) to one catalogue entry, or refuse. | **`title`**, `author`, `edition`, `limit` ≤50 | "Which entry is Sahih al-Bukhari, Sultaniyya printing?" |
| `shamela_cite` with `mode: "printed_page"` | Turn a printed volume/page into the page ids that carry it. | **`book_id`**, **`page`**, `part` | "Open volume 1, page 6 of that printing." |
| `shamela_cite` with `mode: "citation"` (default) | Format a citation in one of five styles. | **`book_id`**, `page_id`, `text`, `style` `shamela` (default) \| `short` \| `full` \| `bibtex` \| `ris` | "Give me a BibTeX entry for this page." |
| `shamela_find` with `kind: "name"` | Rank book and author ids for an Arabic name fragment. Use `kind: "work"` when verifying a citation. When no book title holds the whole name asked for, the response carries `no_confident_match.note`: do not cite the nearest book as the one requested. | **`query`**, `type` `any`\|`book`\|`author`, `limit` ≤20 | "Find the book id for «المغني»." |

## Isnad and narrators

`shamela_lookup_rijal` takes `mode`: `narrators` (default), `narrator`, `isnad_search` or `isnad`.

| Tool | What it does | Key parameters | Try asking |
| --- | --- | --- | --- |
| `shamela_lookup_rijal` with `mode: "narrators"` (default) | Find a narrator (راوٍ) by name among 18,989 narrators, death years 2–774 AH. | **`query`**, `limit` ≤50 | "Find the narrator «الزهري»." |
| `shamela_lookup_rijal` with `mode: "narrator"` | A narrator's dossier: lineage, death year, ṭabaqa, grades, and critics' verdicts quoted with book and page. | **`narrator_id`**, `include_network`, `top_n` | "What did the critics say about this narrator, with sources?" |
| `shamela_lookup_rijal` with `mode: "isnad_search"` | Search 45,220 isnad chains across ten hadith books by narrators contained or a transmission sequence. | `contains`, `transmission`, `scope_book_ids`, `max_results` 1–100 | "Find chains where Malik narrates from Nafi' from Ibn 'Umar." |
| `shamela_lookup_rijal` with `mode: "isnad"` | The chain(s) on one page with names resolved, plus other routes of the same hadith. | **`book_id`**, **`page_id`**, `include_variants`, `max_variants` ≤200 | "Show the chain of the hadith on page 10 of book 1681 and its other routes." |
| `shamela_lookup_hadith` with `mode: "sources"` | Every book citing a hadith, by Shamela's shared hadith key. | **`hadith_key`**, `downloaded_only` | "Which books cite this hadith key?" |

## Quran and tafsir

| Tool | What it does | Key parameters | Try asking |
| --- | --- | --- | --- |
| `shamela_lookup_quran` with `mode: "search"` (default) | Search the 6,236 verses (Hafs from Asim). | **`query`**, `options` | "Which verses contain «الصبر»?" |
| `shamela_lookup_quran` with `mode: "aya"` | Fetch verses by `aya_id` (1–6236) or by surah + ayah, in three renderings. | `aya_id` or `surah` + `aya`, `count` ≤20 | "Show Surah 2, verse 255." |
| `shamela_lookup_tafsir` with `mode: "coverage"` (default) | Per-verse tafsir coverage report: which tafsir books have a page on this verse. Each book gets a status (`indexed_covers` with page id and printed page, `indexed_no_entry_for_this_aya`, or `not_indexed_coverage_unknown`); `results[]` repeats the index hits alone. | `aya_id` or `surah` + `aya`, `downloaded_only` (default true) | "Which tafsirs comment on 2:255, and how well is it covered?" |
| `shamela_lookup_tafsir` with `mode: "texts"` | The commentary texts for one verse across several tafsirs in one call. | `aya_id` or `surah` + `aya`, `book_ids`, `max_sources` ≤10 (default 5) | "Compare what Ibn Kathir and al-Tabari say on 2:255." |

## Catalogue

| Tool | What it does | Key parameters | Try asking |
| --- | --- | --- | --- |
| `shamela_find` with `kind: "book"` (default) | Find books by name, author, bibliography or editorial description. `no_title_match: true` means results came back but no title (with its author's name) carries every word asked for, as with «ديوان الشافعي»; a book the library lacks should be reported as not held here. | **`query`**, `scope`, `options` | "Which printings of «سنن أبي داود» does the library hold?" |
| `shamela_find` with `kind: "author"` | Find authors by name or biography. | **`query`**, `options` | "Find authors named «ابن قدامة»." |
| `shamela_get_details` with `kind: "book"` (default) | Full metadata for one book; 1,368 of the 8,594 have a cover image. | **`book_id`**, `include_cover` | "Show the catalogue record and cover for book 1681." |
| `shamela_get_details` with `kind: "author"` | Metadata for one author, optionally with their books. | **`author_id`**, `include_books` | "List this author's books in the library." |
| `shamela_find` with `kind: "category"` | All 41 categories with book counts. | `include_counts` | "List the library's categories with counts." |
| `shamela_find` with `kind: "period"` | Filter the catalogue by composition year and the main author's death year (AH, 1–2000), AND-combined. | `composed_from`, `composed_to`, `died_from`, `died_to`, `category_id` | "Which fiqh authors died between 600 and 700 AH?" |
| `shamela_get_brief` | The library server's capabilities, limits and search pitfalls, for programmatic callers. | none | Called by agents, not users |

## Prompts

| Prompt | Arguments | What it does |
| --- | --- | --- |
| `takhrij_hadith` | `text` (≤2,000 characters) | Locates a hadith across the collections with each source, its isnad and printed page. Does not grade it. See [Hadith takhrij](./hadith-takhrij.md). |
| `cite_passage` | `text` (≤2,000 characters) | Finds the book, edition and printed page of a passage and cites it with a link. |
| `compare_tafsir` | `surah` (1–114), `ayah` | Compares how the major tafsir works explain one ayah, each view quoted and attributed. |

## Resource

| URI | Type | Content |
| --- | --- | --- |
| `qurangallery://grounding-rules` | `text/markdown` | Grounding and citation rules. See [Search and citations](./search-and-citations.md#grounding-rules) and [Stop hallucinated citations](./stop-hallucinated-citations.md). |

## Tools that do not exist

Some assistants describe tools this server does not have, such as `search_classical_texts`, `get_book_page`, `get_tafsir`, `search_quran` or `get_author_info`. The real names all appear above. If a client shows one of the invented names, it is connected to a different server.

## Renamed and consolidated in 1.4.0

Library 1.4.0 consolidated the 39 tools of 1.3.0 into 11 (14 with `shamela_search_library`, `search` and `fetch`). Each router picks its behaviour with one argument: `match` on `shamela_search`, `kind` on `shamela_find` and `shamela_get_details`, `unit` on `shamela_read`, and `mode` on `shamela_cite` and the `shamela_lookup_*` tools. Every other argument keeps the name and meaning it had.

The old names still work as hidden aliases and are no longer listed by `tools/list`. A result from an alias carries `_meta.deprecated_alias`, and an alias is removed only after 14 days without calls. Docs and new code should use the new names.

| Old name | New call | Renamed argument |
| --- | --- | --- |
| `shamela_search_pages` | `shamela_search` (`match: "words"`) | none |
| `shamela_search_phrase` | `shamela_search` (`match: "phrase"` or `"near"`) | `mode` is now `match` |
| `shamela_search_exact` | `shamela_search` (`match: "exact"`) | none |
| `shamela_search_boolean` | `shamela_search` (`match: "boolean"`) | none |
| `shamela_search_batch` | `shamela_search` (`match: "batch"`) | `probes` is now `queries` |
| `shamela_search_books` | `shamela_find` (`kind: "book"`) | none |
| `shamela_search_titles` | `shamela_find` (`kind: "heading"`) | none |
| `shamela_search_authors` | `shamela_find` (`kind: "author"`) | none |
| `shamela_list_categories` | `shamela_find` (`kind: "category"`) | none |
| `shamela_resolve_work` | `shamela_find` (`kind: "work"`) | none |
| `shamela_resolve_name` (1.3.0: `shamela_resolve`) | `shamela_find` (`kind: "name"`) | none |
| `shamela_list_books_by_period` (1.3.0: `shamela_books_by_period`) | `shamela_find` (`kind: "period"`) | none |
| `shamela_get_page` | `shamela_read` (`unit: "page"`) | none |
| `shamela_get_pages_range` | `shamela_read` (`unit: "range"`) | none |
| `shamela_get_book_section` | `shamela_read` (`unit: "section"`) | none |
| `shamela_get_toc` | `shamela_read` (`unit: "toc"`) | none |
| `shamela_get_book_parts` | `shamela_read` (`unit: "parts"`) | none |
| `shamela_get_page_services` | `shamela_read` (`unit: "services"`) | none |
| `shamela_get_book` | `shamela_get_details` (`kind: "book"`) | none |
| `shamela_get_author` | `shamela_get_details` (`kind: "author"`) | none |
| `shamela_get_citation` | `shamela_cite` (`mode: "citation"`) | none |
| `shamela_resolve_printed_page` | `shamela_cite` (`mode: "printed_page"`) | none |
| `shamela_search_quran` | `shamela_lookup_quran` (`mode: "search"`) | none |
| `shamela_get_aya` | `shamela_lookup_quran` (`mode: "aya"`) | none |
| `shamela_list_tafsirs_for_aya`, `shamela_get_tafseer_of_aya` | `shamela_lookup_tafsir` (`mode: "coverage"`) | none |
| `shamela_get_tafseer_texts` | `shamela_lookup_tafsir` (`mode: "texts"`) | none |
| `shamela_search_hadith` | `shamela_lookup_hadith` (`mode: "search"`) | none |
| `shamela_get_books_for_hadith` | `shamela_lookup_hadith` (`mode: "sources"`) | none |
| `shamela_search_narrators` | `shamela_lookup_rijal` (`mode: "narrators"`) | none |
| `shamela_get_narrator` | `shamela_lookup_rijal` (`mode: "narrator"`) | none |
| `shamela_search_isnad` | `shamela_lookup_rijal` (`mode: "isnad_search"`) | none |
| `shamela_get_isnad` | `shamela_lookup_rijal` (`mode: "isnad"`) | none |
| `shamela_recon` | `shamela_survey_topic` (`mode: "literal"`) | `root` is now `term` |
| `shamela_root_stats` | `shamela_survey_topic` (`mode: "morphological"`) | `root` is now `term` |
| `shamela_brief` | `shamela_get_brief` | none |

Sending only the arguments of one mode also selects it: for example `shamela_read` with `start_page_id` reads a range, and `shamela_search` with `queries` runs a batch. Pass the discriminator anyway; it is clearer to read and does not depend on that inference.

## ChatGPT lists two more tools

`search` and `fetch` are listed to every client, as the standard pair ChatGPT deep research needs. They are a quick generic entry (one argument, unscoped); for hadith, tafsir or fiqh prefer `shamela_search_library`, and use `shamela_search` for a scope, an exact phrase or paging.

## Not exposed

Three library-server tools are withheld because they describe the host machine, not the library: `shamela_list_downloaded_books`, `shamela_check_health` and `shamela_get_guide` (the desktop-extension guide). Use `shamela_find` to read the catalogue. Nothing about the corpus is withheld.

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
- Unscoped raw search ranks by term frequency, not scholarly authority. Pass a scope, or use `shamela_search_library`.
- Search is lexical over Arabic words. There is no semantic or English search.
- Some clients cap the total number of tools they load; this server lists 14.

## Related

- [Search and citations](./search-and-citations.md)
- [Verify a quotation](./verify-a-quotation.md)
- [Rate limits and errors](./rate-limits.md)
- [Library coverage](../references/library-coverage.md)

Canonical guides: [MCP tools for classical Arabic books: the full list](https://qurangallery.com/docs/mcp/tools) · [Choosing a scope](https://qurangallery.com/docs/mcp/scopes)

---

Last reviewed: 2026-10-15
