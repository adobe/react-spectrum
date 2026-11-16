# react-aria-mcp

Optional MCP-enabled bundle for React Aria (@react-aria/mcp + evergreen skill) for clients without shell execution.

## Bundle Type: Optional MCP + Skill Bundle

Starts `@react-aria/mcp@latest` over stdio and installs the `react-aria` skill.
Use this bundle in MCP-only hosts or environments where shell execution is restricted.
For CLI-capable coding agents (Claude Code, GitHub Copilot CLI, OpenAI Codex CLI, Cursor), prefer the lightweight CLI-only plugin (`react-aria`) so no idle MCP server process runs in the background.
