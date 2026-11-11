# 🛡️ GuardMCP

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/raghav1924/guardmcp/actions/workflows/ci.yml/badge.svg)](https://github.com/raghav1924/guardmcp/actions)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-emerald.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Model Context Protocol](https://img.shields.io/badge/MCP-Security-cyan.svg)](https://modelcontextprotocol.io/)

**Developer-first Security Linter, Risk Auditor & Visual Inspector for Model Context Protocol (MCP) servers and AI client configurations.**

[Key Features](#-key-features) • [Quick Start](#-quick-start) • [Security Rules](#-audited-security-rules) • [Visual Web Inspector](#-interactive-visual-inspector) • [CI/CD Gate](#-cicd-pipeline-integration)

</div>

---

## 💡 Why GuardMCP?

In late 2026, the **Model Context Protocol (MCP)** has become the universal runtime standard connecting autonomous AI agents (Claude Desktop, Cursor, Windsurf) directly to developer environments, databases, and local system terminals.

However, standard MCP configurations introduce serious security vulnerabilities:
- **Plaintext Secret Leaks:** API keys and database credentials stored unprotected in client JSON configs.
- **Unsandboxed Shell Interpreters:** Raw execution of `bash`, `sh`, or `zsh` allowing arbitrary command injections.
- **Unrestricted Filesystem Traversal:** Tools granting unbounded read/write access to sensitive directories (`~/.ssh`, `/etc/passwd`, `.env`).
- **Tool Poisoning & Prompt Hijacking:** Deceptive tool descriptions designed to override LLM cognitive boundaries and bypass user confirmation.

**GuardMCP** automatically discovers your local and project-level MCP configurations, analyzes them against rigorous CVE-style heuristics, computes a composite **Security Posture Score (0-100%)**, and serves a modern, dark-mode visual audit dashboard in seconds.

---

## ✨ Key Features

- 🔍 **Zero-Config Auto-Discovery:** Automatically finds configurations in Claude Desktop (`claude_desktop_config.json`), Cursor (`.cursor/mcp.json`), Windsurf, and local repositories.
- 🛡️ **10+ Static Security Heuristics:** Flags command injections, secret exposures, unbounded JSON-RPC schemas, and prompt-injection keywords.
- 📊 **Security Posture Score:** 0-100% health calculation with clear severity ratings (`SECURE`, `ADEQUATE`, `VULNERABLE`, `CRITICAL`).
- 🌐 **Interactive Visual Web Inspector:** Instantly launches a standalone local dashboard (Vercel/Linear dark-mode aesthetic) to inspect servers, tools, and remediation advice.
- 📄 **Single-File HTML Export:** Generates self-contained security audit reports suitable for sharing with security teams or clients.
- 🚀 **CI/CD Quality Gate:** Native flags (`--min-score 80`, `--fail-on critical`) to block PRs when insecure MCP tools are added.
- ⚡ **Zero External Dependencies:** Built with pure TypeScript and Node standard libraries for instant execution and zero supply-chain risk.

---

## 🚀 Quick Start

### 1. Run via NPX or Direct Binary
\`\`\`bash
# Automatically discover and audit all local MCP configurations
npx guardmcp scan

# Scan a specific MCP configuration file
npx guardmcp scan path/to/mcp.json

# Launch the interactive visual browser inspector
npx guardmcp scan --web
\`\`\`

---

## 🛡️ Audited Security Rules

| Rule ID | Name | Severity | What It Detects |
|---|---|---|---|
| **`SEC01`** | **Plaintext Secret Exposure** | `CRITICAL` | Hardcoded API keys, tokens, or passwords inside environment variable maps. |
| **`SEC02`** | **Command Injection Risk** | `CRITICAL / HIGH` | Shell binary spawns (`bash`, `sh`) or unconstrained string parameters passed to command runners. |
| **`SEC03`** | **Filesystem Traversal** | `HIGH` | File tools lacking directory jail/sandbox confinement, exposing sensitive host directories. |
| **`SEC04`** | **Unbounded Schema** | `MEDIUM` | Tools exposing no input schema or argument validation boundaries. |
| **`SEC05`** | **Prompt Hijacking** | `CRITICAL` | Manipulative directives in tool descriptions (e.g., *"ignore previous instructions"*). |

---

## 🌐 Interactive Visual Inspector

Run GuardMCP with the `--web` flag to open the embedded Web Inspector on `http://localhost:4820`:

\`\`\`bash
guardmcp scan --web
\`\`\`

Features of the Visual Inspector:
- High-contrast dark mode with responsive metrics grid.
- Proportional severity bar breakdown.
- Deep-dive cards with exact parameter evidence and remediation steps.
- Direct link to [Jatin Sharma's Portfolio](https://jatinsh.netlify.app/) for case study walkthroughs.

---

## 🚢 CI/CD Pipeline Integration

Enforce security standards across team repositories before merging changes:

\`\`\`bash
# Fail if security score falls below 80%
guardmcp scan .mcp.json --min-score 80

# Fail immediately on any CRITICAL vulnerability
guardmcp scan .mcp.json --fail-on critical

# Export standalone HTML report for build artifacts
guardmcp scan .mcp.json --export ./mcp-audit.html
\`\`\`

### GitHub Actions Workflow Example
\`\`\`yaml
name: MCP Security Audit
on: [push, pull_request]

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Run GuardMCP Security Check
        run: npx guardmcp scan .mcp.json --min-score 85 --fail-on critical
\`\`\`

---

## 🛠 CLI Options & Flags

\`\`\`bash
guardmcp <command> [file-path] [options]

Commands:
  scan, audit [path]      Scan MCP configs (auto-discovers if path omitted)
  inspect                 Launch visual browser security inspector immediately
  help                    Show help documentation

Flags:
  --web                   Start visual Web Inspector dashboard after scan
  --export <file.html>    Save static standalone HTML security report
  --json                  Output machine-readable JSON for pipelines
  --min-score <number>    Fail process if score is below number (e.g., 80)
  --fail-on <severity>    Exit with code 1 on 'critical' or 'high' findings
\`\`\`

---

## 👨‍💻 Author & Open Source

Created with ❤️ by **[Jatin Sharma](https://jatinsh.netlify.app/)**  
*Full-Stack Engineer & Product Designer*

- 🌐 **Portfolio & Case Studies:** [https://jatinsh.netlify.app/](https://jatinsh.netlify.app/)
- 🐙 **GitHub:** [@raghav1924](https://github.com/raghav1924)
- 📦 **Repository:** [https://github.com/raghav1924/guardmcp](https://github.com/raghav1924/guardmcp)

Distributed under the [MIT License](LICENSE).
