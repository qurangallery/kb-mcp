# Contributing

This repository holds the documentation for the Quran Gallery Shamela MCP server at `https://qurangallery.com/mcp/shamela`. It contains no server code and no library text. The server is hosted by Quran Gallery and its source is not published, so issues and pull requests here can only change the documentation.

## Reporting an error

Open an issue when a page here:

- states a number, tool name, parameter, limit or error message that differs from what the live server returns;
- gives a client setup step that no longer works;
- has a broken link.

Include the page, the line, what you expected and what you saw. For server behaviour, include the JSON-RPC request and the response, with any API key removed.

Problems with the server itself (an outage, a wrong passage, a missing book) can be reported the same way; Quran Gallery maintains both the server and this repository.

## Pull requests

Small corrections are welcome. Keep to the conventions the existing pages follow:

- Every figure must be checkable against the live server (`tools/list`, a tool call) or the canonical guide at `https://qurangallery.com/docs/mcp/`.
- Each doc opens with a question-style title and a two-line answer, and ends with `## Limitations`, `## Related`, its canonical guide link and a `Last reviewed` date.
- Quote library text only as a short excerpt with its book and printed page. Do not add longer passages, corpus data or code from the server.
- English only. Write Arabic terms in transliteration with the Arabic script on first use.
- Use relative links between files in this repository.

The `Validate docs` workflow checks every link on each push and pull request, and weekly.

## Licence

By contributing you agree that your contribution is licensed under [CC BY 4.0](./LICENSE), the licence of this documentation.
