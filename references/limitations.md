# What will Quran Gallery's Shamela MCP server not do, and what should I check before trusting a result?

> It finds and cites classical Arabic texts. It does not grade hadith, give rulings, translate, or stop an assistant from misreading a real page.
> Before trusting a result, check four things: printed or automatic pagination, main text or footnote, exact phrase or loose match, and which scope was searched.

The server guarantees one thing: the passage, the book and the page it returns were retrieved from the library, not composed. Everything an assistant says around that passage is the assistant's own reading.

## What it will not do

| It will not | What happens instead |
| --- | --- |
| Grade a hadith as ṣaḥīḥ (صحيح), ḥasan (حسن) or ḍaʿīf (ضعيف) | Where a book or an editor's footnote states a grading, that is returned as text, and belongs to whoever wrote it. `shamela_get_narrator` returns Ibn Hajar's and al-Dhahabi's verdicts on narrators from the register, attributed to them. |
| Give a ruling or fatwa (فتوى) | A passage from a fiqh manual is evidence of what that manual says, not a ruling for anyone's situation. |
| Stop an assistant from misattributing a passage | The page is real; the sentence built around it may not be a fair reading. Rules for assistants: [Stop hallucinated citations](../docs/stop-hallucinated-citations.md). |
| Replace a scholar | Retrieval is not understanding. |
| Export a book | Searches return page-scoped excerpts of about 1,600 characters at most; reading tools return one page or a short range (5 pages keyless, 20 with a key). No call returns a whole book. |
| Search in English or transliteration | Queries must contain Arabic words. The assistant must translate the search terms. |
| Translate | No tool returns a translation. Qur'an verses come back in Arabic renderings only (Hafs from Asim). |
| Say a text "does not exist" | A miss is a finding about the scope searched, not the whole library. |
| Invent bibliographic data | City of publication and edition number are never stored; editor and publisher appear only when recorded. |
| Change anything | Every tool is read-only. |

## Before you trust a result (as of 2026-10-14)

1. **Printed or automatic pagination?** 7,177 of the 8,594 works are paginated as a printed edition (يوافق المطبوع). The other 1,417 use Shamela's automatic numbering (بترقيم الشاملة آليا), which matches no printed copy. Look for `citable: false` from `shamela_resolve_work` or `shamela_resolve_printed_page`, or `auto_numbered: true` from `shamela_get_citation`.
2. **Main text or footnote?** `matchedIn: "footnote"` means the words are in the editor's apparatus (tahqiq, تحقيق), not the author's text (matn, متن). Attribute them to the note.
3. **Exact phrase or loose match?** `relaxedToTokens: true` means the exact phrase was not found; the page only carries the same words separately. It is not a quotation of the phrase.
4. **Which printing?** Page numbers belong to one printing. `edition` and the entry name say which; a page from one printing cannot be cited against another.
5. **Which scope?** "Not in the eight primary collections" is a finding. "Does not exist" is not.
6. **One source or two?** Hits in two entries of the same work (`same_group`, `edition_groups`) are the same text twice.

Field details: [Source attribution](./source-attribution.md).

## Known limitations (as of 2026-10-14)

| Area | Limitation |
| --- | --- |
| Corpus | A fixed copy of Maktabah al-Shamela (المكتبة الشاملة): 8,594 works, 3,188 authors, 41 categories, all downloaded. Books added to Shamela later are not in it until the copy is updated. |
| Scopes | The 12 scopes of `search_library` cover 7,084 works. The other 1,510 are reachable only through the raw `shamela_*` tools and the unscoped `search`. |
| Unscoped ranking | Unscoped search ranks by how often the words occur. For «التيمم» it returns 26,098 hits topped by a 710 AH poetry anthology; for «إنما الأعمال بالنيات» 6,815 hits in which Sahih al-Bukhari does not appear. Use a scope. |
| Takhrij keys | Cross-collection hadith keys exist in ten indexed books only. `shamela_search_hadith` can find a hadith on 1,746 pages and still return takhrij (تخريج) from those ten. |
| Isnad index | 45,220 chains in ten hadith books (book ids 1681, 711, 654, 7895, 829, 28107, 1456, 627/13071 and 642: Bukhari, Muslim, Abu Dawud, al-Tirmidhi, al-Nasa'i, the Muwatta', al-Tayalisi, Ibn al-Jarud and al-Tirmidhi's ʿIlal). Other books return `no_isnad_indexed: true`. |
| Narrators | 18,989 narrators with death years between 2 and 774 AH. Names repeat; check the death year. |
| Searchable text | The main text and footnotes are searchable. A page's `comment` field (user notes) is returned by the page readers but is not searchable. |
| Bibliographic data | No city of publication or edition number. Editor and publisher only where the catalogue records them. The date in a `full` citation is usually the author's death year, not a composition year. |
| Excerpts | `arabic` is capped at about 1,600 characters and marked with `…` where cut. |
| Keyless use | 10 tool calls a minute and 200 a day per IP address, shared by everyone behind that address. |
| ChatGPT | Cannot send a key, so it stays on the keyless limits. |
| Language | Queries must contain Arabic. Results are Arabic. |

Counts are from the live server and the library catalogue on 2026-10-14. The server's own `tools/list` is authoritative for the tool surface.

## Hosted, closed source

The server is hosted by Quran Gallery at `https://qurangallery.com/mcp/shamela`. Its source code is not published, and nothing is installed on your machine. This repository holds documentation only, licensed CC BY 4.0. The texts and catalogue data come from Maktabah al-Shamela; Quran Gallery is not shamela.ws.

## Limitations

This page describes the server's boundaries; it has none of its own beyond being dated. Re-check counts against `tools/list` and the live results after 2026-10-14.

## Related

- [Source attribution](./source-attribution.md)
- [Library coverage](./library-coverage.md)
- [Search and citations](../docs/search-and-citations.md)
- [Hadith takhrij](../docs/hadith-takhrij.md)

Canonical guide: [Quran Gallery MCP server overview](https://qurangallery.com/docs/mcp/overview)

---

Last reviewed: 2026-10-14
