# Contributing New Security Heuristics

To add a new rule:
1. Assign a unique rule ID (e.g. `SEC-011`).
2. Implement AST or configuration detection in `src/core/engine.ts`.
3. Add unit test assertions in `src/tests/`.
