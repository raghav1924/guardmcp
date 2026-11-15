# MCP Client Hardening Best Practices

Security guidelines for configuring LLM client applications (Claude Desktop, Cursor, Custom Agents):
- Always run MCP servers with the lowest privileges required.
- Do not grant unconstrained filesystem write access to the host root directory.
- Avoid passing sensitive environment variables directly into command arguments.
