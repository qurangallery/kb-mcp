"""Minimal Python client for the Quran Gallery MCP server (no key needed).

Maintained version and notes:
https://qurangallery.com/docs/mcp/use-with-langchain-and-agents

Run on 2026-11-01 with mcp 1.30.0 (`pip install "mcp==1.30.0"`) and Python 3.12+.
It lists the tools, then searches one scope and prints book, printed page and
where the words matched (body = author's text, footnote = editor's note).

Optional key: set QG_API_KEY to send it as a bearer token (higher limits).
Never put a real key in source code.
"""

import asyncio
import json
import os

from mcp import ClientSession
from mcp.client.streamable_http import streamablehttp_client

URL = "https://qurangallery.com/mcp/shamela"


async def main() -> None:
    headers = {}
    if os.environ.get("QG_API_KEY"):
        headers["Authorization"] = f"Bearer {os.environ['QG_API_KEY']}"

    async with streamablehttp_client(URL, headers=headers) as (read, write, _):
        async with ClientSession(read, write) as session:
            await session.initialize()

            tools = await session.list_tools()
            print(len(tools.tools), "tools")

            result = await session.call_tool(
                "shamela_search_library",
                {"query": "إنما الأعمال بالنيات", "scope": "hadith-primary", "limit": 3},
            )
            data = json.loads(result.content[0].text)
            for p in data["passages"]:
                print(p["book"], p["printedPage"], p["matchedIn"])


asyncio.run(main())
