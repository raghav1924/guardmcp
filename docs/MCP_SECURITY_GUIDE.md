# MCP Security Best Practices & Hardening Guide

A practical guide to securing Model Context Protocol (MCP) servers and AI client setups with **GuardMCP**.

Author: [Jatin Sharma](https://jatinsh.netlify.app/) (`@raghav1924`)

---

## 1. Eliminate Shell Wrappers in MCP Configs

❌ **Vulnerable:**
```json
{
  "mcpServers": {
    "shell-runner": {
      "command": "/bin/bash",
      "args": ["-c", "node ./server.js"]
    }
  }
}
```

✅ **Secured:**
```json
{
  "mcpServers": {
    "shell-runner": {
      "command": "node",
      "args": ["./server.js"]
    }
  }
}
```

---

## 2. Restrict Path Traversal Boundaries

Always scope filesystem MCP servers to dedicated sandbox folders rather than root or user home directories:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "./safe-sandbox"]
    }
  }
}
```

---

## 3. Continuous Audit in CI/CD

Integrate GuardMCP into your repository workflows:

```bash
npx guardmcp audit --min-score 85
```
