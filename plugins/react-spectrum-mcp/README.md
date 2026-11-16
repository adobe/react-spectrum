# react-spectrum-mcp

Optional MCP-enabled bundle for React Spectrum S2 (@react-spectrum/mcp + evergreen skill) for clients without shell execution.

## Bundle Type: Optional MCP + Skill Bundle

Starts `@react-spectrum/mcp@latest` over stdio and installs the `react-spectrum-s2` skill.
Use this bundle in MCP-only hosts or environments where shell execution is restricted.
For CLI-capable coding agents (Claude Code, GitHub Copilot CLI, OpenAI Codex CLI, Cursor), prefer the lightweight CLI-only plugin (`react-spectrum`) so no idle MCP server process runs in the background.
