# Continuous Integration Setup

Integrate GuardMCP into GitHub Actions or GitLab CI:
```yaml
- name: Audit MCP Configuration
  run: node dist/bin.js audit . --min-score=90 --fail-on-sec
```
