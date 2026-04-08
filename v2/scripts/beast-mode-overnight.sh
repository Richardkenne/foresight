#!/bin/bash
# BEAST MODE — Overnight data download marathon
# Runs all data download scripts sequentially
# Usage: bash scripts/beast-mode-overnight.sh

set -e
cd "$(dirname "$0")/.."
LOG_FILE="/tmp/foresight-beast-mode.log"

echo "=== BEAST MODE STARTED: $(date) ===" | tee -a "$LOG_FILE"
echo "Target: 10M+ data points" | tee -a "$LOG_FILE"

# 1. World Bank 60 new countries
echo "[1/4] World Bank Expansion (60 countries)..." | tee -a "$LOG_FILE"
node scripts/worldbank-expand-countries.mjs >> "$LOG_FILE" 2>&1 || echo "WB expansion failed" | tee -a "$LOG_FILE"
echo "[1/4] DONE: $(date)" | tee -a "$LOG_FILE"

# 2. WHO Global Health Observatory
echo "[2/4] WHO GHO Download..." | tee -a "$LOG_FILE"
node scripts/who-gho-download.mjs >> "$LOG_FILE" 2>&1 || echo "WHO download failed" | tee -a "$LOG_FILE"
echo "[2/4] DONE: $(date)" | tee -a "$LOG_FILE"

# 3. IMF World Economic Outlook
echo "[3/4] IMF WEO Download..." | tee -a "$LOG_FILE"
node scripts/imf-download.mjs >> "$LOG_FILE" 2>&1 || echo "IMF download failed" | tee -a "$LOG_FILE"
echo "[3/4] DONE: $(date)" | tee -a "$LOG_FILE"

# 4. UNDP Human Development Report
echo "[4/4] UNDP HDR Download..." | tee -a "$LOG_FILE"
node scripts/undp-hdr-download.mjs >> "$LOG_FILE" 2>&1 || echo "UNDP download failed" | tee -a "$LOG_FILE"
echo "[4/4] DONE: $(date)" | tee -a "$LOG_FILE"

# Count results
echo "" | tee -a "$LOG_FILE"
echo "=== FINAL COUNT ===" | tee -a "$LOG_FILE"
NEW_FILES=$(find data/cultural/worldbank-expanded data/cultural/who-gho data/cultural/imf-weo data/cultural/undp-hdr -name "*.json" 2>/dev/null | wc -l)
echo "New JSON files: $NEW_FILES" | tee -a "$LOG_FILE"
TOTAL_FILES=$(find data -name "*.json" | wc -l)
echo "Total JSON files: $TOTAL_FILES" | tee -a "$LOG_FILE"
DATA_SIZE=$(du -sh data/ | cut -f1)
echo "Total data size: $DATA_SIZE" | tee -a "$LOG_FILE"

# Git commit (NO push)
echo "" | tee -a "$LOG_FILE"
echo "=== GIT COMMIT ===" | tee -a "$LOG_FILE"
git add data/cultural/worldbank-expanded/ data/cultural/who-gho/ data/cultural/imf-weo/ data/cultural/undp-hdr/ data/*.json scripts/*.mjs scripts/*.sh 2>/dev/null
git commit -m "$(cat <<'EOF'
data: BEAST MODE — massive data expansion (WHO, IMF, UNDP, World Bank 60 countries)

New sources: WHO GHO (80+ health indicators × 194 countries),
IMF WEO (20 economic indicators × all countries),
UNDP HDR (23 human development indices × all countries),
World Bank expanded (200 indicators × 60 new countries).
Target: 10M+ total data points.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)" 2>/dev/null || echo "Nothing to commit" | tee -a "$LOG_FILE"

echo "" | tee -a "$LOG_FILE"
echo "=== BEAST MODE COMPLETE: $(date) ===" | tee -a "$LOG_FILE"
