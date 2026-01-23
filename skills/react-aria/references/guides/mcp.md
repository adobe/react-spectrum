# M

CP Server

Learn how to use the React Aria  server to help AI agents browse the documentation.

## Pre-requisites

[Node.js](https://nodejs.org/) must be installed on your system to run the MCP server.

## Using with an 

MCP client

Add the server to your MCP client configuration (the exact file and schema may depend on your client).

```js
{
  "mcpServers": {
    "React Aria": {
      "command": "npx",
      "args": ["@react-aria/mcp@latest"]
    }
  }
}
```

### Cursor

[Add to Cursor](cursor://anysphere.cursor-deeplink/mcp/install.md?name=React%20Aria\&config=eyJjb21tYW5kIjoibnB4IEByZWFjdC1hcmlhL21jcEBsYXRlc3QifQ%3D%3D)

Or follow Cursor's MCP install [guide](https://docs.cursor.com/en/context/mcp#installing-mcp-servers) and use the standard config above.

### V

S Code

[Add to Visual Studio Code](vscode:mcp/install.md?%7B%22name%22%3A%22React%20Aria%22%2C%22command%22%3A%22npx%22%2C%22args%22%3A%5B%22%40react-aria%2Fmcp%40latest%22%5D%7D)

Or follow VS Code's MCP install [guide](https://code.visualstudio.com/docs/copilot/chat/mcp-servers#_add-an-mcp-server) and use the standard config above. You can also add the server using the VS Code CLI:

```bash
code --add-mcp '{"name":"React Aria","command":"npx","args":["@react-aria/mcp@latest"]}'
```

### Claude 

Code

Use the Claude Code CLI to add the server:

```bash
claude mcp add react-aria npx @react-aria/mcp@latest
```

For more information, see the [Claude Code MCP documentation](https://docs.claude.com/en/docs/claude-code/mcp).

### Codex

Create or edit the configuration file `~/.codex/config.toml` and add:

```
[mcp_servers.react-aria]
command = "npx"
args = ["@react-aria/mcp@latest"]
```

For more information, see the [Codex MCP documentation](https://github.com/openai/codex/blob/main/docs/config.md#mcp_servers).

### Gemini 

CLI

Use the Gemini CLI to add the server:

```bash
gemini mcp add react-aria npx @react-aria/mcp@latest
```

For more information, see the [Gemini CLI MCP documentation](https://github.com/google-gemini/gemini-cli/blob/main/docs/tools/mcp-server.md#how-to-set-up-your-mcp-server).

### Windsurf

Follow the Windsurf MCP [documentation](https://docs.windsurf.com/windsurf/cascade/mcp) and use the standard config above.
