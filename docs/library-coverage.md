# What does the Shamela MCP server's library contain?

> 8,594 works by 3,188 authors in 41 categories from Maktabah al-Shamela (المكتبة الشاملة), plus 6,236 Quran verses, 18,989 narrators and 45,220 indexed isnad chains.
> 7,177 works are paginated as a printed edition; 1,417 carry Shamela's own page numbers. Twelve search scopes cover 7,084 works; the raw tools reach all of them.

Figures are from the live server on 2026-10-14 (`shamela_list_categories`: `downloaded_total: 8594`, and every category's `downloaded_count` equals its `book_count`, so the full text of every catalogue entry is on the server).

## At a glance

| | Count |
| --- | --- |
| Works (catalogue entries; each printing is its own entry) | 8,594 |
| Authors | 3,188 |
| Categories | 41 (40 hold books; the 41st, named `#`, is empty) |
| Works paginated as a printed edition (يوافق المطبوع) | 7,177 |
| Works on Shamela's automatic numbering (بترقيم الشاملة آليا) | 1,417 |
| Works with a scanned printing | 1,745 (377 of them without a cover image) |
| Quran verses (Hafs from Asim) | 6,236 |
| Narrators, death years 2–774 AH | 18,989 |
| Indexed isnad chains, across ten hadith books | 45,220 |

## Categories

Live from `shamela_list_categories {"include_counts": true}`. The `Scope` column names the `search_library` scopes that include the category.

| id | Category | Books | Scope |
| --- | --- | --- | --- |
| 1 | العقيدة (creed) | 807 | `aqeedah` |
| 2 | الفرق والردود (sects and refutations) | 151 | `aqeedah` |
| 3 | التفسير (tafsir) | 274 | `tafsir` |
| 4 | علوم القرآن وأصول التفسير (Quranic sciences) | 312 | `tafsir` |
| 5 | التجويد والقراءات (tajwid and qira'at) | 152 | none |
| 6 | كتب السنة (hadith collections) | 1,243 | `hadith-sciences` |
| 7 | شروح الحديث (hadith commentaries) | 265 | `hadith-sciences` |
| 8 | التخريج والأطراف (takhrij and atraf) | 129 | `hadith-sciences` |
| 9 | العلل والسؤلات الحديثية (hadith defects and questions) | 78 | none |
| 10 | علوم الحديث (hadith sciences) | 320 | `hadith-sciences` |
| 11 | أصول الفقه (usul al-fiqh) | 252 | all five `fiqh-*` |
| 12 | علوم الفقه والقواعد الفقهية (legal maxims) | 58 | all five `fiqh-*` |
| 13 | المنطق (logic) | 11 | none |
| 14 | الفقه الحنفي (Hanafi fiqh) | 87 | `fiqh-hanafi`, `fiqh-comparative` |
| 15 | الفقه المالكي (Maliki fiqh) | 89 | `fiqh-maliki`, `fiqh-comparative` |
| 16 | الفقه الشافعي (Shafi'i fiqh) | 90 | `fiqh-shafii`, `fiqh-comparative` |
| 17 | الفقه الحنبلي (Hanbali fiqh) | 153 | `fiqh-hanbali`, `fiqh-comparative` |
| 18 | الفقه العام (general fiqh) | 208 | all five `fiqh-*` |
| 19 | مسائل فقهية (fiqh questions) | 429 | all five `fiqh-*` |
| 20 | السياسة الشرعية والقضاء (governance and judiciary) | 100 | `fiqh-comparative` |
| 21 | الفرائض والوصايا (inheritance and bequests) | 28 | `fiqh-comparative` |
| 22 | الفتاوى (fatwa collections) | 65 | `fiqh-comparative` |
| 23 | الرقائق والآداب والأذكار (piety, manners, dhikr) | 625 | `lugha` |
| 24 | السيرة النبوية (Prophetic biography) | 187 | `seerah` |
| 25 | التاريخ (history) | 206 | `seerah` |
| 26 | التراجم والطبقات (biographical dictionaries) | 579 | `seerah` |
| 27 | الأنساب (genealogy) | 52 | none |
| 28 | البلدان والرحلات (geography and travel) | 97 | none |
| 29 | كتب اللغة (language) | 79 | `lugha` |
| 30 | الغريب والمعاجم (lexicons) | 135 | `lugha` |
| 31 | النحو والصرف (grammar and morphology) | 213 | `lugha` |
| 32 | الأدب (literature) | 406 | none |
| 33 | العروض والقوافي (prosody) | 9 | none |
| 34 | الشعر ودواوينه (poetry) | 25 | none |
| 35 | البلاغة (rhetoric) | 44 | none |
| 36 | الجوامع (comprehensive collections) | 137 | none |
| 37 | فهارس الكتب والأدلة (indexes and guides) | 102 | none |
| 38 | الطب (medicine) | 14 | none |
| 39 | كتب عامة (general works) | 357 | none |
| 40 | علوم أخرى (other sciences) | 26 | none |

The twelve scopes span 26 categories and 7,084 works. The other 1,510 works are reachable through the raw `shamela_*` tools with `scope.category_ids`.

## The two curated scopes

`hadith-primary` pins each collection to one printing, so a volume and page are checkable:

| `book_id` | Collection | Printing |
| --- | --- | --- |
| 1681 | صحيح البخاري | ط السلطانية |
| 1727 | صحيح مسلم | ت عبد الباقي |
| 117359 | سنن أبي داود | ت الأرنؤوط |
| 7895 | سنن الترمذي | ت بشار عواد |
| 1339 | سنن النسائي | ط الرسالة |
| 98138 | سنن ابن ماجه | ت الأرنؤوط |
| 1699 | موطأ مالك | رواية يحيى، ت عبد الباقي |
| 25794 | مسند أحمد | ط الرسالة |

`tafsir-canonical`, read in this order:

| `book_id` | Work |
| --- | --- |
| 1503 | تفسير ابن كثير |
| 7798 | تفسير الطبري (ت التركي) |
| 23619 | زاد المسير (Ibn al-Jawzi) |
| 30186 | التسهيل لعلوم التنزيل (Ibn Juzayy) |
| 22915 | التفسير المنير (al-Zuhayli) |
| 639 | موسوعة التفسير المأثور |

## Edition metadata

Each printing of a work is its own entry with its own `book_id`; the edition is the suffix after the dash in the entry name. Three fields are derived from the name and front matter, and returned only when recorded:

| `book_id` | Entry | `edition` | `editor` | `publisher` |
| --- | --- | --- | --- | --- |
| 1681 | صحيح البخاري - ط السلطانية | ط السلطانية | not recorded | السلطانية |
| 117359 | سنن أبي داود - ت الأرنؤوط | ت الأرنؤوط | الأرنؤوط | not recorded |
| 6910 | المغني لابن قدامة - ت التركي | ت التركي | التركي | not recorded |
| 9823 | شرح البخاري للسفيري = المجالس الوعظية… | none | none | none |

- In `search_library` and `fetch` passages, an unrecorded field is omitted; `shamela_get_book` returns it as `null`. Nothing is filled in from general knowledge.
- City of publication and edition number (first printing, second printing) are never stored. `shamela_get_citation` lists what is missing in `notes`.
- `shamela_get_book` lists other entries of the same work in `same_group` (seven for book 1681: four other printings of Sahih al-Bukhari and three abridgments). Hits in two entries of one group are one witness, not two; `shamela_search_pages` marks them with `edition_groups`.
- For scanned books, `shamela_get_book` returns a `scan` manifest and often a cover image (`include_cover`). An editor read from the cover is attributed to the cover, not to the metadata.

## Limitations

- The library is the Shamela catalogue; works outside it are not included.
- Page numbers of the 1,417 auto-numbered works are not a printing's and must not be cited as one.
- The hadith-key and isnad indexes cover ten books each; other works are searchable by wording only. See [Hadith takhrij](./hadith-takhrij.md).
- Category labels are Shamela's; the English glosses above are descriptive.

## Related

- [Search and citations](./search-and-citations.md)
- [Verify a quotation](./verify-a-quotation.md)
- [Available tools](./available-tools.md)

Canonical guide: [Choosing a scope](https://qurangallery.com/docs/mcp/scopes)

---
Last reviewed: 2026-10-14
