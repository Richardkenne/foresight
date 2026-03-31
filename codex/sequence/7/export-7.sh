#!/usr/bin/env bash
set -euo pipefail

python3 - <<'PY'
from PIL import Image
from pathlib import Path

base = Path('/Users/richardbotsiokennedy/Simulator/codex/sequence/7')
src = Path('/Users/richardbotsiokennedy/Simulator/codex/sequence/no-money-income-path-evidence.jpeg')
img = Image.open(src).convert('RGB')

crops = [
    ('01-state-and-action.jpeg', (0, 520, 1760, 1500)),
    ('02-bottleneck.jpeg', (1180, 360, 2560, 1560)),
    ('03-first-proof-branch.jpeg', (2160, 360, 3200, 1140)),
    ('04-quit-branch.jpeg', (2160, 860, 3200, 1560)),
    ('05-500-threshold-zone.jpeg', (0, 1080, 3200, 1820)),
    ('06-human-path.jpeg', (0, 1680, 3200, 2420)),
    ('07-evidence-notes-overview.jpeg', (0, 2240, 3200, 3200)),
]

for name, box in crops:
    out = base / name
    img.crop(box).save(out, quality=92)
    print(out)
PY
