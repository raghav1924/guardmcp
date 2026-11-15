# MCP Threat Modeling & Vulnerability Classifications

Analysis of threat vectors affecting Model Context Protocol (MCP) implementations:
- Prompt injection into LLM context through untrusted tool return values.
- Excessive filesystem read/write scope granted to LLM clients.
- Unsanitized child_process arguments leading to arbitrary command execution.
