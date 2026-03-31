#!/usr/bin/env bash
set -euo pipefail

BASE="/Users/richardbotsiokennedy/Simulator/codex"
OUT="/Users/richardbotsiokennedy/Simulator/codex/sequence"

playwright screenshot \
  --device="Desktop Chrome HiDPI" \
  --viewport-size="1600,1200" \
  --wait-for-timeout=1200 \
  "file://$BASE/no-money-income-path.html" \
  "$OUT/no-money-income-path.jpeg"

playwright screenshot \
  --device="Desktop Chrome HiDPI" \
  --viewport-size="1600,1600" \
  --wait-for-timeout=1200 \
  "file://$BASE/no-money-income-path-evidence.html" \
  "$OUT/no-money-income-path-evidence.jpeg"

echo "saved:"
echo "$OUT/no-money-income-path.jpeg"
echo "$OUT/no-money-income-path-evidence.jpeg"
