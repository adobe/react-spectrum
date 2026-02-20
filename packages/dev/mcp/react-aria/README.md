# @react-aria/mcp

The `@react-aria/mcp` package provides a [Model Context Protocol (MCP)](https://modelcontextprotocol.io/docs/getting-started/intro) server for React Aria documentation. It exposes a set of tools that MCP clients can discover and call to browse the docs.

## Installation

### Quick Start

Simply run the server using npx:

```bash
npx @react-aria/mcp@latest
```

### Using with an MCP client

Add the server to your MCP client configuration (the exact file and schema may depend on your client).

```json
{
  "mcpServers": {
    "React Aria": {
      "command": "npx",
      "args": ["@react-aria/mcp@latest"]
    }
  }
}
```

<details>
<summary>Cursor</summary>

#### Click the button to install:

[![Install MCP Server](https://cursor.com/deeplink/mcp-install-dark.svg)](cursor://anysphere.cursor-deeplink/mcp/install?name=React%20Aria&config=eyJjb21tYW5kIjoibnB4IEByZWFjdC1hcmlhL21jcEBsYXRlc3QifQ%3D%3D)

Or follow the MCP install [guide](https://docs.cursor.com/en/context/mcp#installing-mcp-servers) and use the standard config above.

</details>

<details>
<summary>VS Code</summary>

#### Click the button to install:

[<img src="https://img.shields.io/badge/VS_Code-VS_Code?style=flat-square&label=Install%20Server&color=0098FF" alt="Install in VS Code">](vscode:mcp/install?%7B%22name%22%3A%22React%20Aria%22%2C%22command%22%3A%22npx%22%2C%22args%22%3A%5B%22%40react-aria%2Fmcp%40latest%22%5D%7D)

#### Or install manually:

Follow the MCP install [guide](https://code.visualstudio.com/docs/copilot/chat/mcp-servers#_add-an-mcp-server) and use the standard config above. You can also add the server using the VS Code CLI:

```bash
code --add-mcp '{"name":"React Aria","command":"npx","args":["@react-aria/mcp@latest"]}'
```

</details>

<details>
<summary>Claude Code</summary>

Use the Claude Code CLI to add the server:

```bash
claude mcp add react-aria npx @react-aria/mcp@latest
```
For more information, see the [Claude Code MCP documentation](https://docs.claude.com/en/docs/claude-code/mcp).
</details>

<details>
<summary>Codex</summary>

Create or edit the configuration file `~/.codex/config.toml` and add:

```toml
[mcp_servers.react-aria]
command = "npx"
args = ["@react-aria/mcp@latest"]
```

For more information, see the [Codex MCP documentation](https://github.com/openai/codex/blob/main/docs/config.md#mcp_servers).

</details>

<details>
<summary>Gemini CLI</summary>

Use the Gemini CLI to add the server:

```bash
gemini mcp add react-aria npx @react-aria/mcp@latest
```

For more information, see the [Gemini CLI MCP documentation](https://github.com/google-gemini/gemini-cli/blob/main/docs/tools/mcp-server.md#how-to-set-up-your-mcp-server).

</details>

<details>
<summary>Windsurf</summary>

Follow Windsurf MCP [documentation](https://docs.windsurf.com/windsurf/cascade/mcp) and use the standard config above.

</details>

## Tools

| Tool | Input | Description |
| --- | --- | --- |
| `list_react_aria_pages` | `{ includeDescription?: boolean }` | List available pages in the React Aria docs. |
| `get_react_aria_page_info` | `{ page_name: string }` | Return page description and list of section titles. |
| `get_react_aria_page` | `{ page_name: string, section_name?: string }` | Return full page markdown, or only the specified section. |

## Development

### Testing locally

Build the docs and MCP server locally, then start the docs server.

```bash
yarn workspace @react-spectrum/s2-docs generate:md
yarn workspace @react-aria/mcp build
yarn start:s2-docs
```

Update your MCP client configuration to use the local MCP server:

```json
{
  "mcpServers": {
    "React Aria": {
      "command": "node",
      "args": ["{your path here}/react-spectrum/packages/dev/mcp/react-aria/dist/index.js"],
      "env": {
        "DOCS_CDN_BASE": "http://localhost:1234"
      }
    }
  }
}
```