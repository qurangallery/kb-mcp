# mcp-remote (clients that only run local commands)

Some clients, such as older Claude Desktop setups, can start a local program but cannot connect to a URL. [`mcp-remote`](https://github.com/geelen/mcp-remote) is a small bridge that runs locally and talks to the remote server for them. It needs Node.js.

In the client's `mcpServers` configuration, with no key:

```json
{
	"mcpServers": {
		"quran-gallery": {
			"command": "npx",
			"args": ["-y", "mcp-remote", "https://qurangallery.com/mcp/shamela"]
		}
	}
}
```

With a free key, pass it as a header. The value goes in `env`, because some clients mangle a space inside an argument:

```json
{
	"mcpServers": {
		"quran-gallery": {
			"command": "npx",
			"args": [
				"-y",
				"mcp-remote",
				"https://qurangallery.com/mcp/shamela",
				"--header",
				"Authorization:${QG_AUTH}"
			],
			"env": { "QG_AUTH": "Bearer your-key-here" }
		}
	}
}
```

Replace `your-key-here` with your own key, and keep a config file that holds a literal key out of git.

Claude.ai and recent Claude Desktop can add the URL directly as a custom connector, which needs no bridge.

The maintained version, with the other clients, is at <https://qurangallery.com/docs/mcp/connect-any-mcp-client> and <https://qurangallery.com/docs/mcp/bearer-token-setup>.
