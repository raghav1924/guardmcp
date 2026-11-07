# GuardMCP — Product Brief

**Product Name:** `guardmcp` (CLI: `guardmcp`)  
**Date:** 2026-11-07  
**Author:** Jatin Sharma ([https://jatinsh.netlify.app/](https://jatinsh.netlify.app/))  
**GitHub Repository:** `https://github.com/raghav1924/guardmcp`  
**License:** MIT  

---

## 1. Executive Summary & Problem Discovery
In November 2026, the developer ecosystem experienced widespread adoption of the **Model Context Protocol (MCP)**. Developers and autonomous coding agents (Claude Desktop, Cursor, Windsurf, OpenClaw) connect local MCP servers to run database queries, execute shell scripts, and read local files.

However, standard MCP configurations present massive, unmonitored security vulnerabilities:
1. **Tool Poisoning & Rug Pulls:** Malicious or compromised MCP tool definitions silently alter their schemas or prompt instructions mid-session.
2. **Local Environment & Secret Exfiltration:** Rogue filesystem/database tools accessing `.env`, `.ssh/id_rsa`, or private API tokens without developer awareness.
3. **Unsanitized Command & Path Injections:** Missing parameter bounds allowing path traversal (`../../etc/passwd`) or arbitrary bash command substitution.
4. **Shadow MCP Configurations:** Developers accumulate orphan MCP configs across `claude_desktop_config.json`, `.cursor/mcp.json`, and Windsurf without knowing what permissions are exposed.

**Existing solutions:** Heavyweight enterprise SIEM setups or basic manual JSON-RPC inspectors that offer no automated scoring, static vulnerability rules, or instant visual risk audits.

---

## 2. Product Solution: GuardMCP
**GuardMCP** is an ultra-fast, developer-first Security Linter & Runtime Auditor for Model Context Protocol servers and client configurations.

### Core Capabilities:
- 🔍 **Configuration Auto-Discovery:** Automatically locates and parses `claude_desktop_config.json`, Cursor MCP configs, and project-local MCP definitions.
- 🛡️ **Static Security & Vulnerability Analysis:**
  - Evaluates tools against 10+ critical CVE-style heuristics:
    - `SEC01`: Command Injection Risks in tool parameters
    - `SEC02`: Unrestricted Filesystem Path Traversal (`/`, `~`, `..`)
    - `SEC03`: High-Privilege Secret Exposure (`.env`, `AWS_SECRET_ACCESS_KEY`, `.ssh`)
    - `SEC04`: Unbounded JSON-RPC Argument Schemas (arbitrary object/eval)
    - `SEC05`: Suspicious or Deceptive Tool Instructions (prompt injection surfaces)
    - `SEC06`: Plaintext Credential Leaks in environment variables
- 📊 **Security Posture Score (0-100%):** Computes a composite health score with categorized risk badges (Critical, High, Medium, Low).
- 💻 **Interactive CLI + Terminal Dashboard:** ANSI-rendered visual inspection report with actionable remediation advice.
- 🌐 **Embedded Standalone Visual Web Inspector:** Instantly serves or exports a modern, dark-mode audit dashboard (Linear/Vercel design aesthetic) to visualize tool surfaces, risk breakdown, and fix diffs.
- ⚡ **CI/CD Security Gate:** Exit codes (`--max-risk high`, `--min-score 80`) to fail pull requests or pre-commit hooks when insecure MCP tools are added.

---

## 3. Tech Stack & Architecture
- **Language:** TypeScript 5.9 (Strict mode)
- **Runtime:** Node.js (>=18.0.0, zero external production dependencies for maximum speed and zero supply-chain risk)
- **Design System:** Dark-mode terminal typography + responsive Web Inspector with modern CSS variables, badges, and status cards.
- **Testing:** Native Node.js test runner (`node:test`, `node:assert`).
