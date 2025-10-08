# @react-spectrum/mcp

The `@react-spectrum/mcp` package allows you to run [Model Context Protocol (MCP)](https://modelcontextprotocol.io/docs/getting-started/intro) servers for React Spectrum (S2) and React Aria locally. It exposes a set of tools that MCP clients can discover and call to browse the docs.

## Using with an MCP client

Add one or both servers to your MCP client configuration (the exact file and schema may depend on your client).

```json
{
  "mcpServers": {
    "s2-docs": {
      "command": "npx",
      "args": ["@react-spectrum/mcp", "s2"]
    },
    "react-aria-docs": {
      "command": "npx",
      "args": ["@react-spectrum/mcp", "react-aria"]
    }
  }
}
```

<details>
<summary>Cursor</summary>

#### Click the button to install:

React Spectrum (S2):

[![Install MCP Server](https://cursor.com/deeplink/mcp-install-dark.svg)](https://cursor.com/en/install-mcp?name=s2-docs&config=eyJjb21tYW5kIjoibnB4IEByZWFjdC1zcGVjdHJ1bS9tY3AgczIifQ%3D%3D)

React Aria:

[![Install MCP Server](https://cursor.com/deeplink/mcp-install-dark.svg)](https://cursor.com/en/install-mcp?name=react-aria-docs&config=eyJjb21tYW5kIjoibnB4IEByZWFjdC1zcGVjdHJ1bS9tY3AgcmVhY3QtYXJpYSJ9)

Or follow the MCP install [guide](https://docs.cursor.com/en/context/mcp#installing-mcp-servers) and use the standard config above.

</details>

<details>
<summary>VS Code</summary>

#### Click the button to install:

React Spectrum (S2):

[<img src="https://img.shields.io/badge/VS_Code-VS_Code?style=flat-square&label=Install%20Server&color=0098FF" alt="Install in VS Code">](vscode:mcp/install?%7B%22name%22%3A%22s2-docs%22%2C%22command%22%3A%22npx%22%2C%22args%22%3A%5B%22%40react-spectrum%2Fmcp%22%2C%22s2%22%5D%7D)

React Aria:

[<img src="https://img.shields.io/badge/VS_Code-VS_Code?style=flat-square&label=Install%20Server&color=0098FF" alt="Install in VS Code">](vscode:mcp/install?%7B%22name%22%3A%22react-aria-docs%22%2C%22command%22%3A%22npx%22%2C%22args%22%3A%5B%22%40react-spectrum%2Fmcp%22%2C%22react-aria%22%5D%7D)


#### Or install manually:

Follow the MCP install [guide](https://code.visualstudio.com/docs/copilot/chat/mcp-servers#_add-an-mcp-server) and use the standard config above. You can also add servers using the VS Code CLI:

```bash
# For VS Code
code --add-mcp '{"name":"s2-docs","command":"npx","args":["@react-spectrum/mcp","s2"]}'
code --add-mcp '{"name":"react-aria-docs","command":"npx","args":["@react-spectrum/mcp","react-aria"]}'
```

</details>

<details>
<summary>Claude Code</summary>

Use the Claude Code CLI to add the servers:

```bash
claude mcp add s2-docs npx @react-spectrum/mcp s2
claude mcp add react-aria-docs npx @react-spectrum/mcp react-aria
```
For more information, see the [Claude Code MCP documentation](https://docs.claude.com/en/docs/claude-code/mcp).
</details>

<details>
<summary>Codex</summary>

Create or edit the configuration file `~/.codex/config.toml` and add:

```toml
[mcp_servers.s2-docs]
command = "npx"
args = ["@react-spectrum/mcp", "s2"]

[mcp_servers.react-aria-docs]
command = "npx"
args = ["@react-spectrum/mcp", "react-aria"]
```

For more information, see the [Codex MCP documentation](https://github.com/openai/codex/blob/main/docs/config.md#mcp_servers).

</details>

<details>
<summary>Gemini CLI</summary>

Use the Gemini CLI to add the servers:

```bash
gemini mcp add s2-docs npx @react-spectrum/mcp s2
gemini mcp add react-aria-docs npx @react-spectrum/mcp react-aria
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
| `list_pages` | `{ includeDescription?: boolean }` | List available pages in the selected docs library. |
| `get_page_info` | `{ page_name: string }` | Return page description and list of section titles. |
| `get_page` | `{ page_name: string, section_name?: string }` | Return full page markdown, or only the specified section. |
| `search_icons` (S2 only) | `{ terms: string or string[] }` | Search S2 workflow icon names. |
| `search_illustrations` (S2 only) | `{ terms: string or string[] }` | Search S2 illustration names. |
