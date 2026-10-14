# How does search work in the Shamela MCP server, and how are citations given?

> `search_library` searches one of twelve named scopes, tries the exact phrase before the words separately, and returns verbatim Arabic with book, edition, printed volume/page and a shamela.ws link.
> Each passage says whether the words were in the author's main text or an editor's footnote, and whether the exact phrase was found.

## Queries must be Arabic

The library and its index are Arabic. `search_library` and `search` reject a query with no Arabic letters as a tool error (`isError`), with this message:

```text
The library is Arabic, so the query must contain Arabic words. Translate the search terms
into Arabic and call again, for example «إنما الأعمال بالنيات» for "actions are judged by intentions".
```

This applies to English and to transliteration alike. A query that mixes Arabic with other words is accepted. The raw `shamela_*` tools pass the query through unchanged: `shamela_search_phrase` answers an English query with `BAD_ARG: Query has no searchable Arabic words.`, while `shamela_search_pages` searches the Latin letters as given, which is almost never useful.

## Why `search_library` requires a scope

Unscoped, the index ranks by term frequency, which knows nothing about scholarly authority. Measured examples:

| Unscoped query | Result |
| --- | --- |
| `التيمم` (tayammum) | 26,098 hits, topped by a 710 AH poetry anthology |
| `إنما الأعمال بالنيات` | 6,815 hits, with Sahih al-Bukhari absent from the top results |

The twelve scopes:

| Scope | Books |
| --- | --- |
| `hadith-primary` | 8 |
| `tafsir-canonical` | 6 |
| `fiqh-hanafi` | 1,034 |
| `fiqh-maliki` | 1,036 |
| `fiqh-shafii` | 1,037 |
| `fiqh-hanbali` | 1,100 |
| `fiqh-comparative` | 1,559 |
| `aqeedah` | 958 |
| `hadith-sciences` | 1,957 |
| `tafsir` | 586 |
| `seerah` | 972 |
| `lugha` | 1,052 |

`hadith-primary` (the eight primary collections, each pinned to one printing) and `tafsir-canonical` (Ibn Kathir, al-Tabari, Ibn al-Jawzi and three more, read in that order) are curated lists; the other ten are broad shelves. Coverage outside the scopes is in [Library coverage](./library-coverage.md).

## Two passes

1. **Exact phrase**: the words, in order, as written.
2. **Words together**, only if the phrase found nothing: the same words anywhere on a page.

`relaxedToTokens` says which pass answered. When it is `true`, the result carries this `note`:

```text
The exact phrase was not found. These pages carry the words separately, so they answer
a weaker question than the one asked.
```

When neither pass finds anything, `passages` is empty and the note reads: "Neither the exact phrase nor its words together appear anywhere in this scope." That is a finding about the scope searched, not about the whole library.

## What comes back

Live call, 2026-10-14:

```json
{
  "name": "search_library",
  "arguments": { "query": "إنما الأعمال بالنيات", "scope": "hadith-primary" }
}
```

Result summary: `relaxedToTokens: false`, `booksSearched: 8`, `totalMatches: 3`.

| `book` | `printedPage` | `matchedIn` | `matchQuality` | `sourceUrl` |
| --- | --- | --- | --- | --- |
| سنن أبي داود - ت الأرنؤوط | `3/ 526` | `footnote` | `exact_phrase` | https://shamela.ws/book/117359/1796 |
| سنن ابن ماجه - ت الأرنؤوط | `5/ 305` | `body` | `exact_phrase` | https://shamela.ws/book/98138/2939 |
| صحيح البخاري - ط السلطانية | `1/ 6` | `body` | `exact_phrase` | https://shamela.ws/book/1681/10 |

One passage in full (excerpt shortened here):

```json
{
  "book": "صحيح البخاري - ط السلطانية",
  "author": "البخاري",
  "authorDied": 256,
  "bookId": 1681,
  "pageId": 10,
  "printedPage": "1/ 6",
  "arabic": "…عُمَرَ بْنَ الْخَطَّابِ ﵁ عَلَى الْمِنْبَرِ، قَالَ: سَمِعْتُ رَسُولَ اللهِ ﷺ، يَقُولُ: «إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى…",
  "matchedIn": "body",
  "matchQuality": "exact_phrase",
  "sourceUrl": "https://shamela.ws/book/1681/10",
  "edition": "ط السلطانية",
  "publisher": "السلطانية"
}
```

Result fields:

| Field | Meaning |
| --- | --- |
| `passages` | The hits (up to `limit`, 1–10, default 5) |
| `relaxedToTokens` | `true` when the exact phrase was not found |
| `scope` | The scope searched |
| `booksSearched` | Books in that scope |
| `totalMatches` | Pages matched in total; can be `null` on the fallback pass |
| `note` | Present only when the result needs a caveat |

Passage fields:

| Field | Meaning |
| --- | --- |
| `book` | Title including the printing |
| `author`, `authorDied` | Author and death year in AH (`null` if unknown) |
| `printedPage` | Volume and page as that printing paginates it |
| `arabic` | The passage verbatim, markup removed, about 1,600 characters at most. Leading `…`: starts mid-sentence. Trailing `…`: truncated |
| `matchedIn` | `body`, `footnote`, `both` or `unknown` |
| `matchQuality` | How the match was made, e.g. `exact_phrase` |
| `bookId`, `pageId` | Shamela identifiers of the page |
| `edition`, `editor`, `publisher` | Present only when the library records them; never guessed |
| `sourceUrl` | `https://shamela.ws/book/{bookId}/{pageId}` |

To read the whole page, pass `bookId` and `pageId` to `shamela_get_page`.

## Main text or footnote

Modern printings carry two layers: the author's text (matn, المتن) and the editor's footnotes (الحواشي). In the example above, the Abu Dawud hit at `3/ 526` is `matchedIn: "footnote"`. The words sit in a note quoting al-Khattabi's commentary («قال الخطابي: قوله: إنما الأعمال بالنيات…»); Abu Dawud's own text on that page has «بالنية». Presenting that note as Abu Dawud's words would be a false attribution built from true parts.

| `matchedIn` | Say |
| --- | --- |
| `body` | "Abu Dawud writes…" |
| `footnote` | "An editor's note in Sunan Abi Dawud quotes al-Khattabi…" |

To search one layer only:

| Tool | Where the filter goes |
| --- | --- |
| `shamela_search_phrase`, `shamela_search_boolean` | top-level `search_in`: `["body"]` or `["foot"]` |
| `shamela_search_pages` | `options.search_in` |

Putting `search_in` in the wrong place fails strict validation (for example `Unrecognized key(s) in object: 'options'`). The page's `comment` field is not searchable. The raw tools report the layer as `matched_in`.

```json
{
  "name": "shamela_search_phrase",
  "arguments": {
    "query": "إنما الأعمال بالنيات",
    "search_in": ["body"],
    "scope": { "book_ids": [117359, 98138, 1681] }
  }
}
```

Add `"citable_only": true` inside `scope` to keep only books whose page numbering matches a real printed edition; the other 1,417 catalogue entries are paginated by Shamela automatically.

## Arabic normalisation

The index stores normalised words and normalises your query the same way.

| Difference | Example | Same result? |
| --- | --- | --- |
| Diacritics (tashkil, التشكيل) | «إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ» / «إنما الأعمال بالنيات» | Yes |
| Hamza on alif | «انما الاعمال بالنيات» / «إنما الأعمال بالنيات» | Yes |
| Ta marbuta and ha | «رحمة الله» / «رحمه الله» | Yes: 37 hits in Sahih al-Bukhari (Sultaniyya) for both |
| Alif maqsura and ya | «النبى» / «النبي» | Yes: the same 4,707 pages for both |

`shamela_search_pages` returns `normalized_tokens`, the form actually searched.

When a spelling must match exactly, use `shamela_search_exact` with a `preserve` object (`preserve_diacritics`, `preserve_hamza`, `preserve_digits`; at least one true):

```json
{
  "name": "shamela_search_exact",
  "arguments": {
    "query": "عِلْم",
    "preserve": { "preserve_diacritics": true },
    "scope": { "book_ids": [1681] },
    "limit": 5
  }
}
```

It gathers candidates with a normalised search, then checks each page's raw text. Check `candidate_cap_hit` (the candidate list was truncated) and `total_verified` before trusting a negative; the cap scales with `limit`. The `preserve_*` options on `shamela_search_pages` return `OPTION_NOT_SUPPORTED`.

## Root expansion, wildcards and boolean search

| Feature | How | Watch for |
| --- | --- | --- |
| Root expansion | `shamela_search_pages`, `options.morphology: true` | Every root reading is searched. «كتب» expands to `كتب, تبب, توب, وتب`; in Sahih al-Bukhari it matches 110 pages plain and 714 expanded. Read `morphology_expanded_to`. |
| Wildcards | `options.wildcards: true`; `*` any run of letters, `?` one letter | `صيا*` matches 52 pages in Sahih al-Bukhari. Cannot combine with morphology (`OPTION_CONFLICT`). Irregular stored spellings (مائة is stored as ميه) defeat a prefix such as `مائ*`. |
| Boolean | `shamela_search_boolean`: `all_of`, `any_of`, `none_of` | At least one of `all_of` or `any_of`. `total_hits` is exact; `zero_hit_terms` lists words found nowhere. |
| Relaxing an empty query | `shamela_search_pages`, `options.relax_when_empty` (on by default) | Retries with fewer words, never fewer than half; reports `relaxed_min_match` and `relaxed_of_terms`. Set it to `false` when an empty answer is the answer you need. |

## Grounding rules

The server publishes these as the resource `qurangallery://grounding-rules` (`text/markdown`):

1. Quote only what a tool returned. Do not complete a quotation, isnad or wording from memory.
2. Keep main text and footnote apart (`matchedIn`).
3. A printed page is not a Shamela page number. Auto-numbered books are labelled «بترقيم الشاملة آليا»; cite the edition with the page.
4. Never invent publication data. Missing `edition`, `editor` or `publisher` means "not available".
5. Say how the match was made (`relaxedToTokens`).
6. A miss is scoped: "not in these eight collections", never "does not exist".
7. No grading and no rulings. The server never grades a hadith as ṣaḥīḥ, ḥasan or ḍaʿīf and gives no fatwa; a grading quoted by a source is reported as that source's statement.
8. Credit the source: link `sourceUrl` and credit shamela.ws.

A good citation: al-Bukhārī, Ṣaḥīḥ al-Bukhārī, ṭ. al-Sulṭāniyya, 1/6 (main text), with the shamela.ws link. A bad one: a book and hadith number the model remembered.

## Limitations

- A result proves that this passage is printed in this book at this page in this edition. It does not prove authenticity, that the view is the majority view, or that it answers the question asked.
- The server guarantees the passage, book and page are real and retrieved; it cannot guarantee the sentence an assistant builds around them is a fair reading.
- `search` (for ChatGPT deep research) is unscoped and ranks by term frequency.
- One `search_library` call counts as one request against the rate limit ([Limits and errors](./limits-and-errors.md)).

## Related

- [Verify a quotation](./verify-a-quotation.md)
- [Hadith takhrij](./hadith-takhrij.md)
- [Tools reference](./tools.md)

Canonical guides: [search_library reference](https://qurangallery.com/docs/mcp/search-library) · [Choosing a scope](https://qurangallery.com/docs/mcp/scopes) · [Reading a result](https://qurangallery.com/docs/mcp/reading-results) · [Grounding rules](https://qurangallery.com/docs/mcp/grounding-rules)

---
Last reviewed: 2026-10-14
