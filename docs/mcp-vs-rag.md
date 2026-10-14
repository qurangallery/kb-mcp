# Should I use web RAG, my own vector search, or a dedicated MCP server for classical Islamic citations?

> For answers that must cite a printed volume and page, a dedicated server that returns the edition, the printed page and the main-text-or-footnote layer as separate fields removes the steps where web RAG and vector search lose provenance.
> Retrieval-augmented generation (RAG) is still the right tool for open questions, modern sources and paraphrase-level recall. The two combine well.

This page compares three ways of grounding an assistant in classical Arabic texts, using Quran Gallery's Shamela MCP server as the dedicated option.

## The three approaches

| | Web RAG | Your own vector or hybrid index | Dedicated MCP server (Quran Gallery's Shamela MCP) |
| --- | --- | --- | --- |
| What is searched | Whatever web pages the search engine returns: forums, fatwa sites, blogs, scanned PDFs, Shamela mirrors | The texts you collected, split into chunks and embedded (vector search), often combined with keyword scoring (hybrid BM25) | A fixed copy of Maktabah al-Shamela (المكتبة الشاملة): 8,594 works by 3,188 authors, 41 categories |
| What comes back | Snippets of web pages | Chunks, ranked by similarity | Page-scoped passages, each with book, printing, author and death year, printed volume and page, layer and a shamela.ws link |
| Edition identity | Rarely visible: a quoted page number often comes with no printing named | Only if you stored it per chunk | Each printing is its own entry; `edition`, `editor` and `publisher` returned when recorded |
| Printed page | Whatever the page quotes, often unverifiable | Lost unless your chunker kept page boundaries | `printedPage` as the printing paginates it, with automatic numbering flagged |
| Main text vs footnote | Usually flattened | Usually flattened at chunking | `matchedIn`: `body`, `footnote`, `both` or `unknown` |
| Exact wording | Depends on the page copied | Similarity, not identity: a near paraphrase can rank first | Exact phrase first; `relaxedToTokens` says when only the words were found |
| Setup | None | Collect, clean, chunk, embed and host the corpus | One URL, no account, no key |
| Coverage beyond classical texts | The whole web | Whatever you index | None: classical Arabic texts only |

## Where web RAG loses provenance

A web-RAG answer can name a real book and still be wrong about where the words are:

- **Phantom citations.** The model fills in a volume and page that look right because the snippet named the book but not the page, or named a page from a different printing.
- **Bibliographic drift.** A page number copied from one printing is attached to another. Classical works are printed many times, and each printing paginates differently. Sahih al-Bukhari has five printings in the Shamela catalogue plus abridgments.
- **Layer confusion.** A quotation from an editor's footnote is presented as the author's sentence. In Sunan Abi Dawud (al-Arna'ut edition), page `3/ 526`, «إنما الأعمال بالنيات» appears in a note quoting al-Khattabi, not in Abu Dawud's text.
- **Secondary-source laundering.** A blog quotes a fatwa site that quotes a book; the chain ends in a citation nobody checked against the page.

## Where your own vector search loses provenance

Building your own index over Shamela-derived text avoids the open web, but chunking and embedding bring their own failure modes:

- Chunks cross page boundaries, so a passage no longer maps to one printed page.
- Footnotes are merged into the running text unless the extraction kept them apart.
- Embeddings rank meaning, not wording. A paraphrase or a commentary that discusses a hadith can outrank the collection that prints it.
- Edition and pagination metadata must be carried on every chunk, and kept correct when the corpus is updated.
- Arabic normalisation (diacritics, hamza, ta marbuta, alif maqsura) has to be handled consistently at index and query time.

Hybrid BM25 helps exact wording but does not restore page boundaries, layers or editions that the chunking removed.

## How the dedicated server works

What is documented and observable from the live server on 2026-10-14:

- **Lexical, not semantic.** Search runs over Shamela's own full-text (Lucene) index of normalised Arabic words. No tool exposes semantic or vector search. Diacritics, hamza on alif, ta marbuta/ha and alif maqsura/ya are folded at index and query time; `shamela_search_exact` checks the raw text when a spelling must match.
- **Scoped first.** `search_library` refuses to run without one of 12 scopes, because unscoped ranking is by term frequency: «التيمم» unscoped returns 26,098 hits topped by a 710 AH poetry anthology.
- **Two passes.** Exact phrase first; only if that finds nothing, the same words anywhere on a page, flagged with `relaxedToTokens: true`.
- **Page-scoped results.** Every hit is one page record with its printed volume and page, layer and printing.
- **Resolution tools.** `shamela_resolve_work` turns a title and printing into a book id; `shamela_resolve_printed_page` turns a printed volume and page into the page records that carry it; `shamela_get_citation` formats the reference and lists what the catalogue does not record.

Details: [Search and citations](./search-and-citations.md) and [Source attribution](../references/source-attribution.md).

## Which to use

| Need | Use |
| --- | --- |
| A quotation with its printed volume and page | The dedicated server |
| Checking a citation an assistant or a website gave you | The dedicated server: [Verify a quotation](./verify-a-quotation.md) |
| Locating a hadith across the primary collections | The dedicated server: [Hadith takhrij](./hadith-takhrij.md) |
| Contemporary fatwas, news, modern scholarship | Web RAG |
| Your own documents, or texts outside Shamela | Your own index |
| An answer that mixes both | Both: web RAG or your index for context, the dedicated server for every quoted classical text |

In an agent that has both, a simple rule works: any sentence that quotes a classical Arabic text, or names its volume and page, must come from a tool result of the dedicated server, not from a web snippet or memory. [Stop hallucinated citations](./stop-hallucinated-citations.md) sets out that rule in full.

## Limitations

- The dedicated server covers only its copy of Maktabah al-Shamela. Works outside it, and modern sources, need another tool.
- Lexical search needs the right Arabic words. A question asked in English must be translated into Arabic search terms first.
- The server guarantees the page is real, not that the assistant reads it fairly.
- The comparison of web RAG and vector search describes typical pipelines, not any specific product.

## Related

- [Search and citations](./search-and-citations.md)
- [Limitations](../references/limitations.md)
- [Comparison of Islamic text MCP servers](./comparison.md)

Canonical guide: [Quran Gallery MCP server overview](https://qurangallery.com/docs/mcp/overview)

---

Last reviewed: 2026-10-14
