# Changelog

All notable changes to **GuardMCP** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-11-07

### Added
- Auto-discovery for Claude Desktop (`claude_desktop_config.json`) and Cursor configurations.
- 10+ CVE-style security heuristics checking for command injection, plaintext API tokens, unconstrained parameters, and path traversals.
- Aggregate 0-100% Security Health Score calculation with critical/high/medium severity breakdown.
- Interactive embedded dark-mode Web Inspector on `http://localhost:4242`.
- Standalone single-file HTML security audit report exporter (`--export audit.html`).
- Automated CI/CD security gate flags (`--fail-on high`, `--min-score 80`).
- Zero-dependency architecture utilizing Node.js standard libraries.
