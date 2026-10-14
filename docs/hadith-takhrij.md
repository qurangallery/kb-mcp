# How do I find a hadith across the collections with an MCP server (takhrij)?

> Use the `takhrij_hadith` prompt, or call `search_library` with `scope: "hadith-primary"`, then `shamela_search_hadith` and `shamela_get_isnad` to list every collection, page and chain that records it.
> Takhrij here means locating a hadith, not grading it: the server never calls a hadith ṣaḥīḥ, ḥasan or ḍaʿīf.

Takhrij (تخريج الحديث) is the work of tracing where a hadith is recorded, with its chains of transmission (isnad, إسناد) and the printed pages. This page runs it end to end on «إنما الأعمال بالنيات» ("actions are judged by intentions"), with live results from 2026-10-14.

## The ready-made prompt

The server publishes a prompt named `takhrij_hadith` with one argument, `text` (the wording, up to 2,000 characters). In clients that show MCP prompts, pick it and paste the wording. It instructs the model to find the hadith across the collections, report each isnad and printed page, and answer in your language without grading. Clients without prompt support can follow the steps below.

## Step 1: the primary collections

```json
{
  "name": "search_library",
  "arguments": { "query": "إنما الأعمال بالنيات", "scope": "hadith-primary" }
}
```

`booksSearched: 8`, `totalMatches: 3`, `relaxedToTokens: false`:

| Book | `printedPage` | `matchedIn` |
| --- | --- | --- |
| صحيح البخاري - ط السلطانية | `1/ 6` | `body` |
| سنن ابن ماجه - ت الأرنؤوط | `5/ 305` | `body` |
| سنن أبي داود - ت الأرنؤوط | `3/ 526` | `footnote` |

The Abu Dawud hit is an editor's note quoting al-Khattabi's commentary, not Abu Dawud's own wording. Only `body` with `matchQuality: "exact_phrase"` shows the wording is printed in the author's text.

## Step 2: every collection that records it

```json
{
  "name": "shamela_search_hadith",
  "arguments": { "query": "إنما الأعمال بالنيات", "limit": 5 }
}
```

The tool searches the hadith shelves (books of sunnah, hadith commentaries, takhrij works, hadith sciences), then resolves Shamela's shared hadith key. Result summary:

| Field | Value |
| --- | --- |
| `searched` | `hadith_shelves` |
| `books_searched` | 1,957 |
| `total_text_matches` | 1,746 pages |
| `key_index_books` | 10 |
| `takhrij_from_key_index` | `true` |

`matches` lists pages carrying the wording (first: book 1681, page 10, `matched_in: ["body"]`, `hadith_keys: [1]`). `takhrij` groups the books that share hadith key `1` (17 index entries):

| `book_id` | Book | `page_id` |
| --- | --- | --- |
| 1681 | صحيح البخاري - ط السلطانية | 10 |
| 1456 | مسند أبي داود الطيالسي | 41 |
| 627 | المنتقى - ابن الجارود - ت الحويني | 91 |
| 13071 | المنتقى - ابن الجارود - ط الثقافية | 91 |
| 829 | سنن النسائي - ط المصرية | 140 |
| 7895 | سنن الترمذي - ت بشار | 2881 |
| 654 | سنن أبي داود - ط دهلي مع عون المعبود | 2920 |
| 711 | صحيح مسلم - ط التركية | 5879 |

These are library page ids, not printed pages; convert each with `shamela_get_page` or `shamela_get_citation` before citing. `shamela_get_books_for_hadith` takes a `hadith_key` directly and returns the same `book_id`, `book_name`, `author_name`, `page_id`, `downloaded` rows.

## Step 3: the chains

```json
{
  "name": "shamela_get_isnad",
  "arguments": { "book_id": 1681, "page_id": 10, "max_variants": 3 }
}
```

The chain on the page, with narrator names resolved (compiler last):

| `narrator_id` | Name | `death_year` (AH) |
| --- | --- | --- |
| 4677 | أبو حفص عمر بن الخطاب | 23 |
| 4494 | علقمة بن وقاص الليثي | `null` |
| 5443 | محمد بن إبراهيم التيمي | 119 |
| 6932 | يحيى بن سعيد بن قيس بن قهد الأنصاري | 143 |
| 2478 | سفيان بن عيينة بن أبي عمران | 197 |
| 3654 | عبد الله بن الزبير بن عيسى الحميدي | 219 |
| 5495 | البخاري | 256 |

`variants` reports `total_routes: 19` for hadith key 1; with `max_variants: 3` it returned three, including Sahih Muslim (book 711, page 5879) through مالك بن أنس. `shamela_search_isnad` searches the 45,220 indexed chains across ten hadith books by the narrators a chain contains (`contains`) or a transmission sequence (`transmission`).

## Step 4: the narrators

| Tool | Use |
| --- | --- |
| `shamela_search_narrators` | Find a narrator by name among 18,989 (death years 2–774 AH) |
| `shamela_get_narrator` | Dossier by `narrator_id`: lineage, death year, ṭabaqa, grades, and critics' verdicts quoted with book and page |

A critic's verdict in a dossier is that critic's statement, to be reported as quoted, not as the server's or the assistant's judgement.

## Step 5: open and cite each page

`shamela_get_page` returns the page with `body` and `foot` apart; `shamela_get_citation` formats the reference. For Sahih al-Bukhari page 10 the short style gives `البخاري، صحيح البخاري، ج ١، ص ٦.` See [Verify a quotation](./verify-a-quotation.md).

## What a good answer contains

- Each collection and printed page where the hadith appears, with its isnad as printed.
- Wording differences between collections, quoted exactly.
- Which hits are in the author's text and which are in an editor's footnote.
- What was searched, so a miss reads as a miss in that scope only.

It contains no verdict on authenticity. For that, consult a qualified scholar and the books themselves.

## Limitations

- No grading and no rulings. Gradings quoted by a source are reported as that source's statement.
- Takhrij keys exist only in the ten books the hadith-key index covers (`key_index_books`), so a hadith found on 1,746 pages still yields takhrij from those ten. A hadith outside them is found by wording only. Pass `search_all_categories: true` to find who cites a hadith across the whole library rather than who narrates it.
- The isnad index also covers ten books: Sahih al-Bukhari (1681), Sahih Muslim (711), Sunan Abi Dawud (654), Sunan al-Tirmidhi (7895), Sunan al-Nasa'i (829), Muwatta' Malik (28107), Musnad al-Tayalisi (1456), al-Muntaqa of Ibn al-Jarud (627 and 13071) and ʿIlal al-Tirmidhi (642).
- `shamela_search_hadith` scans a limited number of pages for keys (`max_pages_scanned`, 1–50, default 20).
- A full takhrij is several tool calls; keyless use allows 10 a minute ([Rate limits and errors](./rate-limits.md)).

## Related

- [Search and citations](./search-and-citations.md)
- [Verify a quotation](./verify-a-quotation.md)
- [Available tools](./available-tools.md)

Canonical guide: [Hadith takhrij with MCP](https://qurangallery.com/docs/mcp/hadith-takhrij)

---
Last reviewed: 2026-10-14
