#!/usr/bin/env python3
"""
Add URL fields to data points with well-known sources.
Targets JSON files NOT handled by other agents (excludes worldbank-*, bls-*, eurostat*, vc-*, consulting-*, bank-*).
"""

import json
import os
import re
import glob

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")

# Exclusion patterns (handled by other agents)
EXCLUDE_PREFIXES = ["worldbank-", "bls-", "eurostat", "vc-", "consulting-", "bank-"]

# Source -> URL mapping (case-insensitive matching)
SOURCE_URLS = {
    "upwork": "https://www.upwork.com/research",
    "fiverr": "https://www.fiverr.com/resources",
    "linkedin": "https://economicgraph.linkedin.com/",
    "indeed": "https://www.indeed.com/career-advice",
    "glassdoor": "https://www.glassdoor.com/research",
    "forbes": "https://www.forbes.com/",
    "harvard business review": "https://hbr.org/",
    "hbr": "https://hbr.org/",
    "techcrunch": "https://techcrunch.com/",
    "indie hackers": "https://www.indiehackers.com/",
    "indiehackers": "https://www.indiehackers.com/",
    "product hunt": "https://www.producthunt.com/",
    "producthunt": "https://www.producthunt.com/",
    "saastr": "https://www.saastr.com/",
    "sensor tower": "https://sensortower.com/blog",
    "sensortower": "https://sensortower.com/blog",
    "app annie": "https://www.data.ai/",
    "appsflyer": "https://www.appsflyer.com/resources/",
    "stripe": "https://stripe.com/guides",
    "shopify": "https://www.shopify.com/research",
    "youtube": "https://www.youtube.com/",
    "instagram": "https://about.instagram.com/",
    "tiktok": "https://www.tiktok.com/",
    "signalfire": "https://signalfire.com/blog",
    "social blade": "https://socialblade.com/",
    "socialblade": "https://socialblade.com/",
    "linktree": "https://linktr.ee/blog",
    "baremetrics": "https://baremetrics.com/blog",
    "profitwell": "https://www.paddle.com/resources",
    "microconf": "https://microconf.com/",
    "bessemer": "https://www.bvp.com/atlas",
    "first round": "https://review.firstround.com/",
    "firstround": "https://review.firstround.com/",
    "yc": "https://www.ycombinator.com/blog",
    "ycombinator": "https://www.ycombinator.com/blog",
    "y combinator": "https://www.ycombinator.com/blog",
    "combinator": "https://www.ycombinator.com/blog",
    "gartner": "https://www.gartner.com/en/insights",
    "forrester": "https://www.forrester.com/research/",
}


def match_source(source_value: str) -> str | None:
    """Check if a source string contains a known source name. Returns URL or None."""
    source_lower = source_value.lower()
    for key, url in SOURCE_URLS.items():
        if key in source_lower:
            return url
    return None


def process_value(obj, stats: dict):
    """Recursively walk JSON and add url fields where source matches."""
    if isinstance(obj, dict):
        if "source" in obj and isinstance(obj["source"], str) and "url" not in obj:
            url = match_source(obj["source"])
            if url:
                obj["url"] = url
                stats["updated"] += 1
        for v in obj.values():
            process_value(v, stats)
    elif isinstance(obj, list):
        for item in obj:
            process_value(item, stats)


def should_exclude(filename: str) -> bool:
    for prefix in EXCLUDE_PREFIXES:
        if filename.startswith(prefix):
            return True
    return False


def main():
    json_files = sorted(glob.glob(os.path.join(DATA_DIR, "*.json")))

    total_files_processed = 0
    total_updated = 0

    for filepath in json_files:
        filename = os.path.basename(filepath)
        if should_exclude(filename):
            continue

        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)

        stats = {"updated": 0}
        process_value(data, stats)

        if stats["updated"] > 0:
            with open(filepath, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
                f.write("\n")
            print(f"  {filename}: {stats['updated']} data points updated")
            total_updated += stats["updated"]
            total_files_processed += 1
        else:
            # Still count as processed
            pass

    print(f"\n--- SUMMARY ---")
    print(f"Files with updates: {total_files_processed}")
    print(f"Total data points updated: {total_updated}")


if __name__ == "__main__":
    main()
