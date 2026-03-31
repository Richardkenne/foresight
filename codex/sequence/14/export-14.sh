#!/usr/bin/env bash
set -euo pipefail

python3 - <<'PY'
from PIL import Image
from pathlib import Path

base = Path('/Users/richardbotsiokennedy/Simulator/codex/sequence/14')
src = Path('/Users/richardbotsiokennedy/Simulator/codex/sequence/no-money-income-path-evidence.jpeg')
img = Image.open(src).convert('RGB')

crops = [
    ('01-state-full.jpeg', (0, 560, 900, 1500)),
    ('02-state-detail.jpeg', (20, 660, 680, 1360)),
    ('03-arrow-state-action.jpeg', (520, 720, 980, 1320)),
    ('04-action-full.jpeg', (560, 560, 1640, 1500)),
    ('05-action-detail.jpeg', (680, 680, 1460, 1340)),
    ('06-arrow-action-bottleneck.jpeg', (1240, 700, 1700, 1320)),
    ('07-bottleneck-full.jpeg', (1260, 360, 2580, 1580)),
    ('08-bottleneck-title.jpeg', (1450, 520, 2320, 1160)),
    ('09-bottleneck-evidence.jpeg', (1450, 920, 2320, 1420)),
    ('10-pass-branch.jpeg', (2100, 420, 3200, 1120)),
    ('11-first-proof-state.jpeg', (2320, 380, 3200, 1120)),
    ('12-fail-branch.jpeg', (2100, 860, 3200, 1560)),
    ('13-quit-outcome.jpeg', (2320, 860, 3200, 1560)),
    ('14-visible-diagram-overview.jpeg', (0, 420, 3200, 1560)),
]

for name, box in crops:
    out = base / name
    img.crop(box).save(out, quality=92)
    print(out)
PY
