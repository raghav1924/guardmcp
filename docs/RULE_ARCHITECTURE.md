# Security Rule Engine Architecture

GuardMCP evaluates MCP configuration trees through 3 distinct passes:
1. `ClientConfigScanner`: Detects Claude Desktop and Cursor JSON files.
2. `HeuristicEvaluator`: Evaluates 10+ CVE-inspired security rules.
3. `ScoreSynthesizer`: Deducts points based on severity (Critical: -25, High: -15, Medium: -8).
