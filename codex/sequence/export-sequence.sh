#!/usr/bin/env bash
set -euo pipefail

BASE_DIR="/Users/richardbotsiokennedy/Simulator/codex/sequence"
HTML_FILE="$BASE_DIR/no-money-income-sequence.html"

declare -a NAMES=(
  "001-starting-pressure.jpeg"
  "002-low-cost-attempt.jpeg"
  "003-silent-phase.jpeg"
  "004-pre-branch-tension.jpeg"
  "005-fast-collapse.jpeg"
  "006-partial-path.jpeg"
  "007-system-path.jpeg"
)

for i in "${!NAMES[@]}"; do
  step=$((i + 1))
  out="$BASE_DIR/${NAMES[$i]}"
  url="file://$HTML_FILE?step=$step"
  playwright screenshot --device="Desktop Chrome HiDPI" --viewport-size="1600,900" --wait-for-timeout=800 "$url" "$out"
  echo "saved $out"
done
