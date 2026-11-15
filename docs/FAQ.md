# Frequently Asked Questions

### What clients does GuardMCP support?
GuardMCP automatically detects and parses Claude Desktop (`claude_desktop_config.json`), Cursor (`~/.cursor/mcp.json`), and custom MCP configurations.

### Can I run GuardMCP in CI/CD?
Yes, using `guardmcp audit . --min-score=85 --fail-on-sec` which exits with code 1 if security thresholds fail.
