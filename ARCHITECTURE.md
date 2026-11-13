# GuardMCP Architecture & Threat Modeling

This document details the security linter architecture, threat heuristics, and vulnerability scoring algorithm of **GuardMCP**.

Author: [Jatin Sharma](https://jatinsh.netlify.app/) (`@raghav1924`)

---

## Architectural Pipeline

```
Model Context Protocol (MCP) Server Configurations
(claude_desktop_config.json, cursor settings, custom MCP servers)
                           │
                           ▼
             [ Configuration Auto-Discovery ]
             - Local system paths (~/Library/..., ~/.config/...)
             - Raw JSON-RPC tool schemas
                           │
                           ▼
               [ Threat Analysis Engine ]
               ├─ Heuristic 1: Command Injection via shell spawns
               ├─ Heuristic 2: Path Traversal in file read/write tools
               ├─ Heuristic 3: Plaintext secrets in environment blocks
               ├─ Heuristic 4: Broad wildcard access permissions
               └─ Heuristic 5: Dangerous RPC execution parameters
                           │
                           ▼
          [ Security Health Score (0 - 100%) ]
                           │
            ┌──────────────┴──────────────┐
            ▼                             ▼
   CLI Terminal Auditor          Dark-Mode Inspector
    (CI Exit Code 0/1)           (Web Dashboard :7070)
```

---

## 1. Threat Modeling Strategy

As AI clients (Claude Desktop, Cursor, Copilot) integrate Model Context Protocol (MCP) servers, LLMs gain direct execution privileges on local machines. GuardMCP applies static AST and heuristic threat analysis to stop:
- Tools executing arbitrary bash strings (`/bin/sh -c`, `cmd.exe`).
- File servers with root `/` or `C:\` base paths permitting full filesystem traversal.
- Hardcoded API keys and bearer tokens stored unencrypted in JSON configs.

---

## 2. Health Scoring Algorithm

GuardMCP calculates a weighted health score:
$$\text{Score} = \max\left(0, 100 - \sum w_i \cdot \text{severity}_i\right)$$
Where CRITICAL findings deduct 35 points, HIGH findings deduct 20 points, and MEDIUM findings deduct 10 points.

