# How do I verify a quotation from a classical Islamic book with MCP?

> Resolve the edition with `shamela_resolve_work`, turn the printed volume/page into page ids with `shamela_resolve_printed_page`, read each page with `shamela_get_page`, then format the reference with `shamela_get_citation`.
> Each step's result decides the next; a page number is only comparable against the printing it came from.

There is no single "verify" tool. The worked example below checks the claim: *Sahih al-Bukhari, Sultaniyya edition, vol. 1, p. 6, has «إنما الأعمال بالنيات».*

## Before you start: which edition?

Printings paginate differently. In Sahih al-Bukhari, the Sultaniyya edition (ط السلطانية) prints this hadith at `1/ 6`; al-Bugha's edition (ت البغا) prints it at `1/ 3`. Both are correct for their printing.

Of the library's 8,594 entries, 7,177 are flagged by Shamela as matching a printed edition (يوافق المطبوع). The other 1,417 carry Shamela's own page numbers, which cannot be checked against any printing.

## Step 1: resolve the edition

```json
{
  "name": "shamela_resolve_work",
  "arguments": { "title": "صحيح البخاري", "edition": "ط السلطانية" }
}
```

Result: `status: "exact"`, `match.book_id: 1681`, `citable: true`.

| Outcome | Meaning | Next |
| --- | --- | --- |
| `status: "exact"`, `citable: true` | One catalogue entry, printed pagination | Step 2 |
| `status: "not_found"`, `reason: "edition_not_found"` | The library does not hold that printing | Report it; offer `available_editions` |
| `citable: false` | Shamela's own numbering | Stop: no printed page to verify |

Asking for `ط دار طوق النجاة` returns `edition_not_found` with `available_editions`:

| `book_id` | Entry | `citable` |
| --- | --- | --- |
| 735 | ت البغا | true |
| 907 | بحاشية السهارنفوري - ت الندوي | true |
| 1284 | ط التأصيل | true |
| 1376 | ن عطاءات العلم | false |
| 1681 | ط السلطانية | true |

The title must be the start of the work's name; `author` is a filter, not a search. Use this tool rather than `shamela_resolve`, which ranks and therefore always returns a winner.

## Step 2: resolve the printed page

```json
{
  "name": "shamela_resolve_printed_page",
  "arguments": { "book_id": 1681, "part": "1", "page": 6 }
}
```

Live result, 2026-10-14 (abridged):

```json
{
  "book_id": 1681,
  "book_name": "صحيح البخاري - ط السلطانية",
  "requested_part": "1",
  "requested_page": 6,
  "page_ids": [9, 10, 11],
  "citable": true,
  "status": "ok"
}
```

One printed page spans three library pages here, and the response's note says to read all of them. Reading only the first and concluding the quotation is absent is a false negative.

| `status` | Meaning |
| --- | --- |
| `ok` | `page_ids` lists every library page that carries the printed page |
| `page_not_in_part` | The volume exists but not that page; `page_range` gives the real range (volume 1: 2 to 173) |
| `part_not_found` | No such volume; `available_parts` lists those that exist |
| `no_printed_pagination` | The book has no printed numbering |
| `book_not_downloaded` | The library does not hold this book's text |

Volume labels are not always digits: a front-matter part can be labelled «المقدمة» (the introduction).

## Step 3: read the page

```json
{
  "name": "shamela_get_page",
  "arguments": { "book_id": 1681, "page_id": 10 }
}
```

The page has three fields:

| Field | Content |
| --- | --- |
| `body` | The author's text (matn) |
| `foot` | The editor's footnotes |
| `comment` | Readers' notes |

For page 10, `body` contains the hadith («إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى…») and `foot` is empty. Compare the quotation with `body` and `foot` separately; the layer is part of the claim.

Shortcut when you have the wording but not the page: `search_library` with the phrase and a scope returns `printedPage`, `matchedIn` and `relaxedToTokens` in one call. If `relaxedToTokens` is `true`, the exact phrase was not found.

## Step 4: write the citation

```json
{
  "name": "shamela_get_citation",
  "arguments": { "book_id": 1681, "page_id": 10, "style": "short" }
}
```

| `style` | Output for this page |
| --- | --- |
| `short` | `البخاري، صحيح البخاري، ج ١، ص ٦.` |
| `shamela` (default) | `«صحيح البخاري» (١/ ٦)` |
| `full`, `bibtex`, `ris` | Long form and reference-manager formats |

The response includes `components` with `auto_numbered: false`. For a book on Shamela's own numbering, `auto_numbered` is `true` and every style except `short` states that the numbering is Shamela's («بترقيم الشاملة آليا»).

## Reading the outcome

| What you find | What you may say |
| --- | --- |
| Words in `body` of the cited page | The quotation is printed there, in the author's text |
| Words only in `foot` | It is in an editor's note, not the author's text |
| Words on another page of the same edition | The wording is real; the page reference is wrong |
| Words only in another edition | The reference belongs to a different printing |
| Words nowhere in the scope searched | Not in those books; this does not prove they appear nowhere |
| The cited page does not exist | The reference is for another printing, or was invented |

## Limitations

- This establishes where a passage is printed and in which layer. It does not establish that the passage is authentic, that any attribution inside it is sound, or that it was read fairly.
- City of publication and edition number are never stored, so a citation cannot include them from this library.
- Keyless use allows 10 tool calls a minute; a full verification is four calls ([Rate limits and errors](./rate-limits.md)).

## Related

- [Search and citations](./search-and-citations.md)
- [Hadith takhrij](./hadith-takhrij.md)
- [Library coverage and edition metadata](./library-coverage.md)

Canonical guide: [Grounding rules for answers built on the library](https://qurangallery.com/docs/mcp/grounding-rules)

---
Last reviewed: 2026-10-14
