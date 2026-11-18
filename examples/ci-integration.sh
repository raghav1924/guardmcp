#!/usr/bin/env bash
set -euo pipefail

echo "⚡ Running GuardMCP CI validation pipeline..."
node dist/bin.js --version
echo "✔ GuardMCP executable verified."
