# GuardMCP CLI Cheatsheet

```bash
# Scan local MCP configurations
guardmcp audit .

# Enforce CI quality gates
guardmcp audit . --min-score=90 --fail-on-sec

# Launch Web Inspector
guardmcp ui --port 7070
```
