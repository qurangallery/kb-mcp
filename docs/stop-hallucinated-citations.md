# How do I stop an AI assistant from inventing volume, page and hadith numbers?

> Make every cited text come from a tool result: resolve the edition, resolve the printed page, read the page, quote it verbatim, and abstain when any step fails.
> Quran Gallery's Shamela MCP server supplies each step as a tool and returns the printed volume and page with every passage, so the assistant has no gap to fill from memory.

A phantom citation is a reference that looks right (a real book, a plausible volume, a fabricated page number or hadith number) but that nobody ever checked against a printed page. Assistants produce them when they know a book exists but not where the words are. The fix is procedural: the assistant may only cite what a tool returned in this conversation.

## The five steps

| Step | Tool | It answers | Abstain when |
| --- | --- | --- | --- |
| 1. Resolve the edition | `shamela_find` with `kind: "work"` (title, optional `author`, `edition`) | Which catalogue entry, and so which printing, the claim refers to | `status: "not_found"`, or `citable: false` (automatic numbering, no printed page to check) |
| 2. Resolve the printed page | `shamela_cite` with `mode: "printed_page"` (`book_id`, `page`, `part`) | Which page records carry that printed volume and page | No page ids come back |
| 3. Read the page | `shamela_read` (`unit: "page"`) for each page id | The full text, with main text (`body`) and footnotes (`foot`) apart | The words are not on the page, or only in the footnotes when the claim is about the author |
| 4. Quote verbatim | Copy from the tool result | The exact Arabic as printed | Never repair, re-point or complete the Arabic |
| 5. Format the reference | `shamela_cite` (`mode: "citation"`) | A citation built from recorded data, with `notes` naming what is not recorded | Do not fill missing editor, publisher, city or edition number |

When the user has wording but no reference, a scoped `shamela_search_library` call does steps 1 to 3 in one move: each passage carries `printedPage`, `matchedIn` and the printing. Check `relaxedToTokens`: if it is `true`, the exact phrase was not found and the hit is not a quotation of it.

Worked through with live results: [Verify a quotation](./verify-a-quotation.md).

## What "abstain" should sound like

An abstention names what was searched and what was not found. It is a finding, not a failure.

| Situation | Say | Do not say |
| --- | --- | --- |
| Empty result in `hadith-primary` | "This wording is not in the eight primary collections searched." | "This hadith does not exist." |
| `relaxedToTokens: true` | "The exact phrase was not found; these pages contain the same words separately." | A quotation of the phrase with that page |
| `matchedIn: "footnote"` | "An editor's note in this book quotes…" | "The author says…" |
| `citable: false` | "This page number is Shamela's automatic numbering (بترقيم الشاملة آليا), not a printed page." | The number as a printed page |
| `relaxed.dropped_term`, `morphology_fallback: true`, or `relaxed_min_match` | "No page held every word of the query. This is a near match: one word was dropped / these are other forms of the same roots / only some of the words are on the page." | The result as a match for the whole wording |
| `no_confident_match`, or `no_title_match: true` | "No book in the library is titled with the whole name you gave; the closest titles are …" | The closest title cited as the book asked for |
| Printing not in the library | "The library does not hold that printing; it holds these: …" | The page from another printing |
| `editor` or `publisher` missing | "The library does not record the editor." | An editor recalled from memory |

## A system prompt you can copy

For an agent that has the server connected:

```text
When you quote or cite a classical Arabic text:
1. Quote only text returned by a Quran Gallery tool in this conversation.
   Never complete a quotation, an isnad, a page number or a hadith number from memory.
2. Cite the book, the printing (edition), the printed volume and page (printedPage)
   and the sourceUrl. A page number without its printing is not a citation.
3. If matchedIn is "footnote", attribute the words to the editor's note, not the author.
4. If relaxedToTokens is true, or a result carries relaxed, morphology_fallback or
   relaxed_min_match, say the exact wording was not found and how the match was made.
5. If citable is false or auto_numbered is true, label the page as Shamela's
   automatic numbering, not a printed page.
6. Never supply an editor, publisher, city or edition number the tools did not return.
7. If a search finds nothing, say which scope was searched. Never say a text does not exist.
8. Do not grade hadith or issue rulings. Report any grading as the statement of
   the book that contains it, with its page.
9. If no_confident_match or no_title_match is returned, report the book as not held
   here. Never cite a similarly named book in its place.
```

The server already publishes its own version of these rules as the resource `qurangallery://grounding-rules` and in its server instructions, which most clients pass to the model. A system prompt makes them binding for your agent rather than advisory.

## Checking an answer you already have

When an assistant, a website or a social post gives a reference such as "Sahih al-Bukhari 1/6":

1. Ask which printing. If none is named, the page number cannot be checked; say so.
2. Run steps 1 to 3 above for that printing.
3. Compare the quoted wording with `body` on the page, not with the footnotes.

The live example: «إنما الأعمال بالنيات» is in the main text of صحيح البخاري, ط السلطانية (Sahih al-Bukhari, Sultaniyya printing) at `1/ 6`, page records 9, 10 and 11. The same words in Sunan Abi Dawud (al-Arna'ut edition) at `3/ 526` are in a footnote quoting al-Khattabi.

## Limitations

- The tools guarantee that a page is real and that the words are on it. They cannot stop an assistant from drawing a wrong conclusion from a real page.
- A client may ignore server instructions and resources; only a system prompt or your own code can enforce the rules.
- 1,417 works carry only automatic page numbers; a claim citing a printed page in one of them cannot be verified here.
- `shamela_search_library` results carry no hadith number. Cite the printed volume and page instead.

## Related

- [Verify a quotation](./verify-a-quotation.md)
- [Source attribution](../references/source-attribution.md)
- [Limitations](../references/limitations.md)
- [Web RAG, vector search or a dedicated MCP server](./mcp-vs-rag.md)

Canonical guide: [Grounding rules](https://qurangallery.com/docs/mcp/grounding-rules)

---

Last reviewed: 2026-10-14
