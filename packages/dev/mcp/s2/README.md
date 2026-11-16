# @react-spectrum/mcp

The `@react-spectrum/mcp` package provides a [Model Context Protocol (MCP)](https://modelcontextprotocol.io/docs/getting-started/intro) server for React Spectrum (S2) documentation. It exposes a set of tools that MCP clients can discover and call to browse the docs, search for icons and illustrations, and more. It also bundles the React Aria docs tools, so you can browse React Aria documentation from the same server.

## Installation

### Quick Start

Simply run the server using npx:

```bash
npx @react-spectrum/mcp@latest
```

### Using with an MCP client

Add the server to your MCP client configuration (the exact file and schema may depend on your client).

```json
{
  "mcpServers": {
    "React Spectrum (S2)": {
      "command": "npx",
      "args": ["@react-spectrum/mcp@latest"]
    }
  }
}
```

<details>
<summary>Cursor</summary>

#### Click the button to install:

[![Install MCP Server](https://cursor.com/deeplink/mcp-install-dark.svg)](cursor://anysphere.cursor-deeplink/mcp/install?name=React%20Spectrum%20(S2)&config=eyJjb21tYW5kIjoibnB4IEByZWFjdC1zcGVjdHJ1bS9tY3BAbGF0ZXN0In0%3D)

Or follow the MCP install [guide](https://docs.cursor.com/en/context/mcp#installing-mcp-servers) and use the standard config above.

</details>

<details>
<summary>VS Code</summary>

#### Click the button to install:

[<img src="https://img.shields.io/badge/VS_Code-VS_Code?style=flat-square&label=Install%20Server&color=0098FF" alt="Install in VS Code">](vscode:mcp/install?%7B%22name%22%3A%22React%20Spectrum%20(S2)%22%2C%22command%22%3A%22npx%22%2C%22args%22%3A%5B%22%40react-spectrum%2Fmcp%40latest%22%5D%7D)

#### Or install manually:

Follow the MCP install [guide](https://code.visualstudio.com/docs/copilot/chat/mcp-servers#_add-an-mcp-server) and use the standard config above. You can also add the server using the VS Code CLI:

```bash
code --add-mcp '{"name":"React Spectrum (S2)","command":"npx","args":["@react-spectrum/mcp@latest"]}'
```

</details>

<details>
<summary>Claude Code</summary>

Use the Claude Code CLI to add the server:

```bash
claude mcp add react-spectrum-s2 npx @react-spectrum/mcp@latest
```
For more information, see the [Claude Code MCP documentation](https://docs.claude.com/en/docs/claude-code/mcp).
</details>

<details>
<summary>Codex</summary>

Create or edit the configuration file `~/.codex/config.toml` and add:

```toml
[mcp_servers.react-spectrum-s2]
command = "npx"
args = ["@react-spectrum/mcp@latest"]
```

For more information, see the [Codex MCP documentation](https://github.com/openai/codex/blob/main/docs/config.md#mcp_servers).

</details>

<details>
<summary>Gemini CLI</summary>

Use the Gemini CLI to add the server:

```bash
gemini mcp add react-spectrum-s2 npx @react-spectrum/mcp@latest
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
| `resolve_versions` | `{ cwd?: string, version?: string, snapshot?: string }` | Resolve exact installed/lockfile `@react-spectrum/s2` and `react-aria-components` package versions and return a reusable `resolution` context. |
| `search_docs` | `{ query: string, cwd?: string, resolution?: object, library?: string, version?: string, snapshot?: string, limit?: number }` | Search version-matched React Spectrum S2 and React Aria components, guides, patterns, tokens, and icons (defaults to ranking S2 first). |
| `read_docs` | `{ ids: string \| string[], sections?: string[], maxTokens?: number, cwd?: string, resolution?: object, version?: string, snapshot?: string }` | Batch-read multiple version-matched components or guides in a single call with per-entry provenance and partial-batch resilience. |
| `get_component_api` | `{ target: string, prop?: string, cwd?: string, resolution?: object, version?: string, snapshot?: string }` | Inspect structured TypeScript API definitions (props, events, slots, generics, overloads) for an S2 or RAC component. |
| `search_s2_tokens` | `{ query?: string, property?: string, cwd?: string, resolution?: object, version?: string, snapshot?: string }` | Query Spectrum 2 style-macro properties and design tokens from the versioned snapshot. |
| `search_s2_icons` | `{ query: string, kind?: 'icon' \| 'illustration' \| 'all', cwd?: string, resolution?: object, version?: string, snapshot?: string }` | Search Spectrum 2 workflow icons and illustrations from the versioned snapshot. |

The server also exposes the evergreen CLI-first skill via MCP resource `skills://react-spectrum-s2/SKILL.md` (`SEP-2640`) and discovers workspace roots via MCP `roots/list` (or `--cwd <dir>`).

## Privacy Policy

See [Adobe's privacy policy](https://www.adobe.com/privacy/policy.html).

## Development

### Testing locally

Generate a local documentation snapshot and build the MCP server:

```bash
yarn generate:snapshots
yarn workspace @react-spectrum/mcp build
```

Update your MCP client configuration to use the local MCP server:

```json
{
  "mcpServers": {
    "React Spectrum (S2)": {
      "command": "node",
      "args": ["{your path here}/react-spectrum/packages/dev/mcp/s2/dist/mcp/s2/src/index.js"],
      "env": {
        "RSP_AGENT_DOCS_SNAPSHOT_SOURCE": "{your path here}/react-spectrum/packages/dev/s2-docs/dist/snapshots"
      }
    }
  }
}
```

## Bundling

To build an [MCP Bundle (MCPB)](https://github.com/modelcontextprotocol/mcpb), first prepare the staging directory:

```bash
yarn workspace @react-spectrum/s2-docs generate:mcpb
```

Then validate and pack using the [`@anthropic-ai/mcpb`](https://www.npmjs.com/package/@anthropic-ai/mcpb) CLI (paths are printed by the script above):

```bash
npx @anthropic-ai/mcpb validate <staging-dir>
npx @anthropic-ai/mcpb pack <staging-dir> <output-path>
```