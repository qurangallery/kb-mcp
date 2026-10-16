# What source attribution does each Quran Gallery MCP result carry?

> Every search hit names the book (including its printing), the author and death year (AH), the printed volume and page, whether the words are in the main text or an editor's footnote, and a link to the same page on shamela.ws.
> Edition, editor and publisher are returned only when the library records them; they are never guessed. City and edition number are never recorded.

This page is the field-by-field reference for attributing a passage from Quran Gallery's Shamela MCP. The examples are live results from 2026-10-14.

## Fields on a search hit

A passage from `shamela_search_library` (and the record behind `fetch`):

```json
{
  "book": "صحيح البخاري - ط السلطانية",
  "author": "البخاري",
  "authorDied": 256,
  "bookId": 1681,
  "printedPage": "1/ 6",
  "pageId": 10,
  "arabic": "…عُمَرَ بْنَ الْخَطَّابِ ﵁ عَلَى الْمِنْبَرِ، قَالَ: سَمِعْت…",
  "matchedIn": "body",
  "matchQuality": "exact_phrase",
  "sourceUrl": "https://shamela.ws/book/1681/10",
  "edition": "ط السلطانية",
  "publisher": "السلطانية"
}
```

(`arabic` shortened here.)

| Field | Meaning | Always present? |
| --- | --- | --- |
| `book` | The catalogue entry's name. The printing follows the dash: «ط» (طبعة, printing), «ت» (تحقيق, edited by) | Yes |
| `author` | Main author | Yes |
| `authorDied` | Author's death year, AH | When known |
| `printedPage` | Volume and page as that printing paginates it, `"volume/ page"` | Yes |
| `bookId`, `pageId` | Shamela's own ids for the entry and the page record | Yes |
| `arabic` | The passage as printed, markup removed, at most about 1,600 characters. A leading `…` means it starts mid-sentence; a trailing `…` means it was cut at the cap | Yes |
| `matchedIn` | `body`, `footnote`, `both` or `unknown`: which layer of the page holds the words | Yes |
| `matchQuality` | How the match was made, for example `exact_phrase` | Yes |
| `sourceUrl` | `https://shamela.ws/book/{bookId}/{pageId}`, the same page on shamela.ws | Yes |
| `edition` | The printing's label from the entry name | Only when recorded |
| `editor` | The editor (muhaqqiq, محقق) | Only when recorded |
| `publisher` | The publisher | Only when recorded |

The result as a whole also carries `relaxedToTokens` (`true` when the exact phrase was not found), `scope`, `booksSearched` and `totalMatches`.

## Three different numbers

| Number | Example | What it is | Cite it? |
| --- | --- | --- | --- |
| `printedPage` | `1/ 6` | Volume 1, page 6 of the Sultaniyya printing | Yes, with the printing |
| `pageId` | `10` | Shamela's internal record id | No |
| `bookId` | `1681` | Shamela's id for this printing | No; name the book and printing |

There is no arithmetic between a printed page and a `pageId`. One printed page is often split across several records: page `1/ 6` of book 1681 is records 9, 10 and 11. `shamela_cite` with `mode: "printed_page"` maps a printed reference to all of them, and its notes say to read every record, because quoting the first alone presents part of a page as the whole.

## Main text or footnote

Modern printings have two layers: the author's text (matn, متن) and the editor's apparatus (tahqiq, تحقيق) in the footnotes, which holds cross-references, gradings and quotations from other scholars.

| `matchedIn` | Attribute the words to |
| --- | --- |
| `body` | The author: "al-Bukhari narrates…" |
| `footnote` | The editor's note, and whoever the note quotes: "An editor's note in Sunan Abi Dawud quotes al-Khattabi…" |
| `both` | Read the page; the words are in both layers |
| `unknown` | Read the page before attributing |

In the live search for «إنما الأعمال بالنيات» in `hadith-primary`, the Sunan Abi Dawud hit at `3/ 526` is `footnote`: the words are in a note quoting al-Khattabi, not in Abu Dawud's text.

## Edition, editor and publisher

Each printing of a work is its own catalogue entry with its own `bookId`. The library derives three fields from the entry name and front matter:

| `bookId` | Entry | `edition` | `editor` | `publisher` |
| --- | --- | --- | --- | --- |
| 1681 | صحيح البخاري - ط السلطانية | ط السلطانية | not recorded | السلطانية |
| 117359 | سنن أبي داود - ت الأرنؤوط | ت الأرنؤوط | الأرنؤوط | not recorded |
| 6910 | المغني لابن قدامة - ت التركي | ت التركي | التركي | not recorded |
| 9823 | شرح البخاري للسفيري = المجالس الوعظية في شرح أحاديث خير البرية | none | none | none |

- In `shamela_search_library` and `fetch` passages, an unrecorded field is left out. `shamela_get_details` returns it as `null`.
- Nothing is filled in from general knowledge.
- The library never stores the city of publication or the edition number (first printing, second printing).
- To pick a printing on purpose, use `shamela_find` with `kind: "work"`, `title` and `edition`. When the named printing is absent it returns `status: "not_found"`, `reason: "edition_not_found"` and the `available_editions` that do exist.

### Covers

1,745 books have a scanned printing; 1,368 of them ship a cover image and 377 do not. `shamela_get_details` attaches the cover (a small title-page thumbnail) when there is one, and its notes point out that the cover often prints the editor the metadata lacks. If you take the editor from the image, attribute it to the cover, not to the metadata.

## Ready-made citations: shamela_cite

`shamela_cite` formats a reference in five styles: `shamela` (the default), `short`, `full`, `bibtex` and `ris`. Every reply also carries `components` (the parts it used) and a `notes` list naming what is missing.

| Style | Live output |
| --- | --- |
| `shamela`, with `text` | `«صحيح البخاري» (١/ ٦):` and then `«إنما الأعمال بالنيات»` on the next line |
| `short` | `البخاري، صحيح البخاري، ج ١، ص ٦.` |
| `full` | `أبو داود (ت ٢٧٥هـ). سنن أبي داود. ٢٧٥هـ، ج ٣، ص ٥٢٦.` |
| `bibtex`, `ris` | Machine-readable records for Zotero, EndNote or Mendeley |

The `full` reference above (book 117359, page id 1796) came with these notes:

```text
المحقق (من اسم الشاملة): الأرنؤوط
edition number not available in master.db
publisher not available in master.db
city of publication not available in master.db
```

Keep the notes with the citation. They say which parts to leave out or take from the book's title page.

The year after the title in `full` style is Shamela's «تاريخ الكتاب» (book date). The `shamela_get_details` description warns that on 98.5% of dated books this is the main author's death year, not a composition year, so do not cite it as the year the book was written.

## Automatic pagination vs printed pagination

7,177 of the 8,594 works are flagged by Shamela as matching a printed edition (يوافق المطبوع). The other 1,417 use Shamela's own automatic numbering (بترقيم الشاملة آليا), which corresponds to no printing.

| Where | Printed pagination | Automatic pagination |
| --- | --- | --- |
| `shamela_find` (`kind: "work"`), `shamela_cite` (`mode: "printed_page"`) | `citable: true` | `citable: false` |
| `shamela_cite` (`mode: "citation"`) | `auto_numbered: false` | `auto_numbered: true`, and the text ends «بترقيم الشاملة آليا» |
| Search tools with `citable_only` | Kept | Filtered out |

Live example, book 1376 (another entry of Sahih al-Bukhari, the Ata'at al-Ilm printing), `full` style:

```text
البخاري (ت ٢٥٦هـ). صحيح البخاري. ٢٥٦هـ، ج المقدمة، ص ٧، بترقيم الشاملة آليا.
```

Such a page number cannot be checked against any printed copy. Cite it only with that label, or find the passage in a printing-paginated entry.

## Several entries, one source

`shamela_get_details` lists other entries of the same work in `same_group`. For book 1681 it lists seven: four other printings of Sahih al-Bukhari and three abridgments. Hits in two entries of one group are the same text twice, not two independent sources. When search hits land in several entries of one work, `shamela_search` adds `edition_groups` so they can be read as one source.

## A complete attribution

From the Bukhari hit above:

> «إنما الأعمال بالنيات» — al-Bukhari (d. 256 AH), Sahih al-Bukhari, Sultaniyya printing, vol. 1, p. 6 (main text). Via Maktabah al-Shamela, <https://shamela.ws/book/1681/10>, through Quran Gallery's Shamela MCP.

It names the work, the printing, the printed volume and page, the layer, and the library the text came from.

## Copyright of the editions

A modern printing of a classical work has two layers of authorship. The author's text is centuries old; the edited edition, with its footnotes, indexes and typesetting, is the work of an editor and a publisher, whose rights stay with them. Nothing here grants a right in the library's text. The CC BY 4.0 licence of this repository covers the documentation only, and the server returns excerpts for citation and checking, not for republication. For any use beyond a short quotation with its citation, go to the publisher, shown in a hit's `publisher` field when the library records it.

## Credit and excerpts

The texts, ids and catalogue data are Maktabah al-Shamela's (المكتبة الشاملة). Quran Gallery runs the MCP server over its own copy of the library and is not shamela.ws; `sourceUrl` lets any reader open the same page there. Searches return page-scoped excerpts capped at about 1,600 characters and the reading tools return single pages or short ranges; no call exports a book. Modern printings contain the editor's own work, so quote what the claim needs, with the citation, rather than reproducing pages at length.

## Limitations

- Edition data is as uneven as the catalogue: some entries name an editor, some a publisher, some neither.
- City of publication and edition number are not available from any tool.
- The date in a `full` citation is usually the author's death year, not a composition year.
- `matchedIn: "unknown"` gives no layer; read the page.
- Automatic page numbers (1,417 works) cannot be verified against a printing.

## Related

- [Search and citations](../docs/search-and-citations.md)
- [Verify a quotation](../docs/verify-a-quotation.md)
- [Library coverage](./library-coverage.md)

Canonical guide: [Reading a result](https://qurangallery.com/docs/mcp/reading-results)

---

Last reviewed: 2026-10-14
