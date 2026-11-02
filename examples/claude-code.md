# Claude Code

Add the server with one command. No key is needed:

```bash
claude mcp add --transport http quran-gallery https://qurangallery.com/mcp/shamela
```

Check that it shows as connected:

```bash
claude mcp list
```

To use a free key for the higher limits, keep it in an environment variable so it is not typed into the command:

```bash
export QG_MCP_KEY='your-key-here'
claude mcp add --transport http quran-gallery \
  https://qurangallery.com/mcp/shamela \
  --header "Authorization: Bearer $QG_MCP_KEY"
```

`claude mcp add` stores the header value in the Claude Code configuration for the scope you chose, so that file then holds the key. Keep it out of git. Create keys at <https://accounts.qurangallery.com/developers>.

To go back to keyless use: `claude mcp remove quran-gallery`, then add it again without `--header`.

The maintained version of this page, with the other clients, is at <https://qurangallery.com/docs/mcp/claude-code> and <https://qurangallery.com/docs/mcp/bearer-token-setup>.
