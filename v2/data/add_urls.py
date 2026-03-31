#!/usr/bin/env python3
"""Add 'url' field to _meta in vc-*, consulting-*, and bank-* JSON files."""

import json
import glob
import os

DATA_DIR = os.path.dirname(os.path.abspath(__file__))

# Map source names (from _meta.source) to URLs
URL_MAP = {
    # VC firms
    "Y Combinator": "https://www.ycombinator.com/blog",
    "Sequoia Capital": "https://www.sequoiacap.com/articles",
    "Founders Fund": "https://foundersfund.com",
    "Lightspeed Venture Partners": "https://lsvp.com/stories",
    "Andreessen Horowitz": "https://a16z.com/writing",
    "Accel Partners": "https://www.accel.com/noteworthy",
    "Benchmark Capital": "https://www.benchmark.com",
    # Consulting firms
    "McKinsey & Company": "https://www.mckinsey.com/featured-insights",
    "BCG": "https://www.bcg.com/publications",
    "Bain": "https://www.bain.com/insights",
    "KPMG": "https://kpmg.com/xx/en/home/insights.html",
    "EY": "https://www.ey.com/en_gl/insights",
    "Deloitte": "https://www2.deloitte.com/us/en/insights.html",
    "PwC": "https://www.pwc.com/gx/en/issues.html",
    # Banks
    "JPMorgan Chase": "https://www.jpmorgan.com/insights",
    "Goldman Sachs": "https://www.goldmansachs.com/insights",
    "Morgan Stanley": "https://www.morganstanley.com/ideas",
    "Credit Suisse (now UBS)": "https://www.credit-suisse.com/about-us/en/reports-research.html",
    "Deutsche Bank": "https://www.db.com/news",
    "HSBC": "https://www.hsbc.com/insight",
    "UBS": "https://www.ubs.com/global/en/wealth-management/insights.html",
    "Citibank/Citigroup": "https://www.citigroup.com/global/insights",
    "Bank of America": "https://business.bofa.com/en-us/content/economic-insights.html",
    "Barclays": "https://www.investmentbank.barclays.com/our-insights.html",
}

patterns = ["vc-*.json", "consulting-*.json", "bank-*.json"]
updated = []
skipped = []

for pattern in patterns:
    for filepath in sorted(glob.glob(os.path.join(DATA_DIR, pattern))):
        filename = os.path.basename(filepath)
        # Skip this script if somehow matched
        if filename.endswith(".py"):
            continue

        with open(filepath, "r") as f:
            data = json.load(f)

        meta = data.get("_meta", {})
        source = meta.get("source", "")

        if source in URL_MAP:
            meta["url"] = URL_MAP[source]
            data["_meta"] = meta
            with open(filepath, "w") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
                f.write("\n")
            updated.append(f"{filename}: {URL_MAP[source]}")
        else:
            skipped.append(f"{filename}: source='{source}' (no URL mapping)")

print(f"\n--- Updated {len(updated)} files ---")
for u in updated:
    print(f"  + {u}")

if skipped:
    print(f"\n--- Skipped {len(skipped)} files ---")
    for s in skipped:
        print(f"  ? {s}")

print(f"\nDone.")
