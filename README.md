# Quran Gallery MCP server — classical Islamic texts with printed-page citations

> A free, hosted Model Context Protocol (MCP) server that lets an AI assistant search 8,594 classical Islamic works — hadith, tafsir, fiqh, aqeedah, Arabic language — and quote them by edition, volume and printed page. Endpoint: `https://qurangallery.com/mcp/shamela`. No API key, no account, no install.

The server is run by [Quran Gallery](https://qurangallery.com/mcp) (qurangallery.com) over its own copy of the Maktabah al-Shamela library (المكتبة الشاملة): 8,594 works by 3,188 authors in 41 categories. Every passage it returns carries the book, the author and their death year (AH), the printed volume and page, the edition, editor and publisher when the library records them, and a link to the same page on shamela.ws. It is not affiliated with shamela.ws.

This repository is **documentation only**. The server source code is not published, and no library text is included here beyond short cited excerpts.

|                             |                                                     |
| --------------------------- | --------------------------------------------------- |
| Endpoint                    | `https://qurangallery.com/mcp/shamela`              |
| Transport                   | Streamable HTTP (POST), stateless, no session id    |
| Authentication              | None required; optional free key raises limits      |
| Tools / prompts / resources | 39 / 3 / 1                                          |
| Library                     | 8,594 works, 3,188 authors, 41 categories           |
| Keyless limit               | 10 tool calls a minute and 200 a day per IP address |
| Price                       | Free                                                |

## Quick start

Most MCP clients accept a remote server as a URL. The universal shape:

```json
{
  "mcpServers": {
    "quran-gallery": {
      "url": "https://qurangallery.com/mcp/shamela"
    }
  }
}
```

Claude Code, in one line:

```bash
claude mcp add --transport http quran-gallery https://qurangallery.com/mcp/shamela
```

Then ask your assistant something the library can answer. Queries to the library must be in Arabic; the assistant translates for you.

- "Where does Sahih al-Bukhari record the hadith إنما الأعمال بالنيات? Give the volume and page."
- "Verify this quotation and tell me which edition and page it is on: …"
- "Compare what the classical tafsirs say on Surah al-Baqarah, verse 255."
- "Which of the four madhhabs' fiqh books discuss خيار المجلس, and what do they say? Cite each page."

## Documentation

- [Connect Claude, Claude Desktop and Claude Code](./docs/connect-claude.md)
- [Connect ChatGPT (including deep research)](./docs/connect-chatgpt.md)
- [Connect Cursor](./docs/connect-cursor.md)
- [Connect VS Code](./docs/connect-vscode.md)
- [Connect Gemini CLI](./docs/connect-gemini-cli.md)
- [Connect GitHub Copilot](./docs/connect-copilot.md)
- [Connect any MCP client (SDK, mcp-remote, Inspector, curl, Python)](./docs/connect-any-client.md)
- [Available tools: all 39 tools, 3 prompts and 1 resource](./docs/available-tools.md)
- [Search and citations: scopes, Arabic search, main text vs footnotes, grounding rules](./docs/search-and-citations.md)
- [Verify a quotation: edition, printed page, layer, citation](./docs/verify-a-quotation.md)
- [Hadith takhrij: collections, pages and chains for one hadith](./docs/hadith-takhrij.md)
- [Rate limits and errors: keyless and keyed tiers, free keys, error codes](./docs/rate-limits.md)
- [Library coverage: categories, scopes, editions and page numbering](./docs/library-coverage.md)
- [Islamic MCP servers compared: Shamela, turath.io, hadith and Quran](./docs/comparison.md)
- [FAQ](./docs/faq.md)

The full documentation is also published at [qurangallery.com/docs/mcp](https://qurangallery.com/docs/mcp/overview).

## Registry manifest

[`server.json`](./server.json) describes the remote server in the MCP Registry format (schema 2025-12-11) under the name `com.qurangallery/shamela`, with the optional `Authorization` header declared as not required.

## License

The documentation in this repository is licensed under [Creative Commons Attribution 4.0 International](./LICENSE) (CC BY 4.0). The license covers this documentation only. It does not cover the server software, which is not published, or the texts in the library, whose editions belong to their publishers.
