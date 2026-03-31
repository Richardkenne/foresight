#!/usr/bin/env python3
"""
Scan all JSON files in data/ (excluding worldbank-*, bls-*, eurostat*)
and add 'url' fields to data points whose 'source' matches known sources.
Does NOT overwrite existing 'url' fields.
"""

import json
import os
import glob
import sys

DATADIR = os.path.dirname(os.path.abspath(__file__))

# Source name (lowercased for matching) -> URL
SOURCE_URLS = {
    "cb insights": "https://www.cbinsights.com/research/",
    "mckinsey": "https://www.mckinsey.com/featured-insights",
    "pitchbook": "https://pitchbook.com/news/reports",
    "statista": "https://www.statista.com/",
    "pew research": "https://www.pewresearch.org/",
    "pew": "https://www.pewresearch.org/",
    "gallup": "https://www.gallup.com/analytics/",
    "who": "https://www.who.int/data",
    "cdc": "https://www.cdc.gov/nchs/",
    "census bureau": "https://data.census.gov/",
    "census": "https://data.census.gov/",
    "irs": "https://www.irs.gov/statistics",
    "oecd": "https://data.oecd.org/",
    "apa": "https://www.apa.org/pubs/journals",
    "nra": "https://restaurant.org/research-and-media/research/",
    "national restaurant association": "https://restaurant.org/research-and-media/research/",
    "grand view research": "https://www.grandviewresearch.com/",
    "numbeo": "https://www.numbeo.com/",
    "first page sage": "https://firstpagesage.com/seo-blog/",
    "mailerlite": "https://www.mailerlite.com/blog",
    "wordstream": "https://www.wordstream.com/blog",
}

# Stats per source
stats = {}
for key in SOURCE_URLS:
    stats[key] = 0


def match_source(source_value):
    """Return the URL if source matches any known source (case-insensitive partial match)."""
    src_lower = source_value.lower()
    # Try longer keys first to avoid partial false matches
    for key in sorted(SOURCE_URLS.keys(), key=len, reverse=True):
        if key in src_lower:
            return key, SOURCE_URLS[key]
    return None, None


def process_obj(obj):
    """Recursively find dicts with 'source' field and add 'url' if missing."""
    updated = 0
    if isinstance(obj, dict):
        if "source" in obj and "url" not in obj:
            source_val = obj["source"]
            if isinstance(source_val, str):
                matched_key, url = match_source(source_val)
                if url:
                    obj["url"] = url
                    stats[matched_key] += 1
                    updated += 1
        for v in obj.values():
            updated += process_obj(v)
    elif isinstance(obj, list):
        for item in obj:
            updated += process_obj(item)
    return updated


def main():
    files = sorted(glob.glob(os.path.join(DATADIR, "*.json")))
    # Exclude worldbank-*, bls-*, eurostat*
    files = [
        f for f in files
        if not any(
            x in os.path.basename(f)
            for x in ["worldbank-", "bls-", "eurostat"]
        )
    ]

    total_updated = 0
    files_modified = 0

    for filepath in files:
        try:
            with open(filepath, "r", encoding="utf-8") as fh:
                data = json.load(fh)
        except (json.JSONDecodeError, UnicodeDecodeError):
            continue

        count = process_obj(data)
        if count > 0:
            with open(filepath, "w", encoding="utf-8") as fh:
                json.dump(data, fh, indent=2, ensure_ascii=False)
                fh.write("\n")
            total_updated += count
            files_modified += 1

    print(f"\n{'='*50}")
    print(f"URL Fix Report")
    print(f"{'='*50}")
    print(f"Files scanned: {len(files)}")
    print(f"Files modified: {files_modified}")
    print(f"Total data points updated: {total_updated}")
    print(f"\nPer source:")
    print(f"{'Source':<30} {'Count':>8}")
    print(f"{'-'*30} {'-'*8}")
    for key in sorted(stats.keys()):
        if stats[key] > 0:
            print(f"{key:<30} {stats[key]:>8}")


if __name__ == "__main__":
    main()
