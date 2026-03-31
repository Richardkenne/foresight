#!/usr/bin/env python3
"""
Fix vague sources in simulator data files.

Scans all .json files in the data directory, finds entries with vague sources
like "Estimated", "Research", "Various", "Multiple sources", etc.

Improvements applied:
1. If entry has a year field -> append year to source
2. If entry has a category/section context -> make source more specific
3. Entries that remain purely vague are flagged

Excluded files: templates.ts, worldbank-*, bls-*, eurostat*, vc-*, consulting-*, bank-*
"""

import json
import glob
import os
import re
import sys
from collections import defaultdict

DATA_DIR = os.path.dirname(os.path.abspath(__file__))

# Files to skip (other agents handle these)
EXCLUDED_PREFIXES = ['worldbank-', 'bls-', 'eurostat', 'vc-', 'consulting-', 'bank-']

# Purely vague sources (case-insensitive match)
PURELY_VAGUE = {
    'estimated', 'research', 'various', 'multiple sources',
    'various sources', 'industry research', 'industry estimate',
    'general knowledge', 'common knowledge', 'industry estimates',
    'industry data', 'multiple studies', 'multiple',
    'logical estimate', 'estimate', 'research consensus',
    'multiple brokers', 'multiple surveys', 'multiple studies',
}

# Sources that are vague but have a real org prefix (e.g. "PMC/Estimated", "PMC/NIH/Estimated")
# These get the "/Estimated" part cleaned up but keep the org(s)
SLASH_ESTIMATED_PATTERN = re.compile(r'^(.+)\s*/\s*[Ee]stimated$')

# Map filename stems to human-readable topic for enrichment
def filename_to_topic(filename: str) -> str:
    """Convert filename to a readable topic string."""
    stem = filename.replace('.json', '')
    # Replace hyphens with spaces, title case
    topic = stem.replace('-', ' ').replace('_', ' ')
    # Clean up common suffixes
    for suffix in ['datapoints', 'stats', 'data', 'batch']:
        topic = re.sub(rf'\b{suffix}\b', '', topic)
    return topic.strip().title()


def derive_category(item: dict, section_key: str, filename: str) -> str:
    """Derive a category string from available context."""
    # Priority 1: explicit category field
    if 'category' in item and item['category']:
        cat = item['category'].replace('_', ' ').title()
        return cat

    # Priority 2: section key from parent dict
    if section_key and section_key not in ('metadata', 'meta', 'sections', '_meta'):
        cat = section_key.replace('_', ' ').title()
        return cat

    # Priority 3: type field
    if 'type' in item and item['type']:
        return item['type'].replace('_', ' ').title()

    # Priority 4: metric field prefix
    if 'metric' in item and item['metric']:
        metric = item['metric']
        # Take first part before underscore as category hint
        parts = metric.split('_')
        if len(parts) >= 2:
            return parts[0].title()

    # Fallback: filename topic
    return filename_to_topic(filename)


def improve_source(source: str, item: dict, section_key: str, filename: str) -> tuple:
    """
    Improve a vague source string.
    Returns (new_source, improvement_type) where improvement_type is:
      'enriched' - meaningfully improved
      'year_only' - only year added
      'still_vague' - couldn't improve
    """
    source_stripped = source.strip()
    source_lower = source_stripped.lower()

    year = item.get('year')
    category = derive_category(item, section_key, filename)

    # Case 1: Slash pattern like "PMC/Estimated" -> "PMC (2024)" or "PMC — Category"
    slash_match = SLASH_ESTIMATED_PATTERN.match(source_stripped)
    if slash_match:
        org = slash_match.group(1).strip()
        if year:
            return f"{org} ({year})", 'enriched'
        elif category:
            return f"{org} — {category}", 'enriched'
        else:
            return org, 'enriched'

    # Case 2: "Estimated (Something)" - already has context, just clean up
    if source_lower.startswith('estimated (') and source_stripped.endswith(')'):
        return source_stripped, 'already_ok'

    # Case 3: "Estimated from ..." - already has context
    if source_lower.startswith('estimated from '):
        if year and str(year) not in source_stripped:
            return f"{source_stripped} ({year})", 'enriched'
        return source_stripped, 'already_ok'

    # Case 4: Purely vague sources
    if source_lower in PURELY_VAGUE:
        if year and category:
            return f"Industry estimate — {category} ({year})", 'enriched'
        elif year:
            return f"Estimated ({year})", 'year_only'
        elif category:
            return f"Industry estimate — {category}", 'enriched'
        else:
            return source_stripped, 'still_vague'

    # Case 5: Contains "estimate" or "research" but has other context
    # e.g. "logical estimate based on BLS data" - leave mostly alone, add year
    if any(w in source_lower for w in ['estimate', 'estimated', 'research']):
        if year and str(year) not in source_stripped:
            return f"{source_stripped} ({year})", 'enriched'
        return source_stripped, 'already_ok'

    return source_stripped, 'already_ok'


def is_vague_source(source: str) -> bool:
    """Check if a source string is vague enough to warrant improvement."""
    s = source.strip().lower()

    # Exact match with purely vague
    if s in PURELY_VAGUE:
        return True

    # Contains /Estimated pattern
    if SLASH_ESTIMATED_PATTERN.match(source.strip()):
        return True

    # Other vague patterns
    vague_indicators = [
        'estimated', 'estimate', 'various', 'multiple',
        'general knowledge', 'common knowledge',
    ]
    # Only flag short sources with vague words (long ones likely have real context)
    if len(s) < 30 and any(w in s for w in vague_indicators):
        return True

    return False


def process_file(filepath: str, dry_run: bool = False) -> dict:
    """Process a single JSON file. Returns stats dict."""
    filename = os.path.basename(filepath)

    stats = {
        'total_entries': 0,
        'vague_found': 0,
        'enriched': 0,
        'year_only': 0,
        'still_vague': 0,
        'already_ok': 0,
        'still_vague_entries': [],
    }

    with open(filepath, 'r') as f:
        try:
            data = json.load(f)
        except json.JSONDecodeError:
            return stats

    modified = False

    def process_items(items: list, section_key: str = ''):
        nonlocal modified
        for item in items:
            if not isinstance(item, dict) or 'source' not in item:
                continue
            stats['total_entries'] += 1
            source = item['source']

            if not is_vague_source(source):
                continue

            stats['vague_found'] += 1
            new_source, improvement_type = improve_source(source, item, section_key, filename)

            if improvement_type == 'still_vague':
                stats['still_vague'] += 1
                stats['still_vague_entries'].append({
                    'file': filename,
                    'id': item.get('id', '?'),
                    'source': source,
                    'metric': item.get('metric', item.get('stat', '?'))[:80],
                })
            elif improvement_type == 'year_only':
                stats['year_only'] += 1
                if new_source != source:
                    item['source'] = new_source
                    modified = True
            elif improvement_type == 'enriched':
                stats['enriched'] += 1
                if new_source != source:
                    item['source'] = new_source
                    modified = True
            else:  # already_ok
                stats['already_ok'] += 1

    if isinstance(data, list):
        process_items(data)
    elif isinstance(data, dict):
        for key, value in data.items():
            if isinstance(value, list):
                process_items(value, section_key=key)

    if modified and not dry_run:
        with open(filepath, 'w') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
            f.write('\n')

    return stats


def main():
    dry_run = '--dry-run' in sys.argv
    verbose = '--verbose' in sys.argv or '-v' in sys.argv

    if dry_run:
        print("=== DRY RUN MODE (no files will be modified) ===\n")

    json_files = sorted(glob.glob(os.path.join(DATA_DIR, '*.json')))

    # Filter excluded files
    eligible_files = []
    for f in json_files:
        basename = os.path.basename(f)
        if any(basename.startswith(prefix.rstrip('-')) for prefix in EXCLUDED_PREFIXES):
            continue
        eligible_files.append(f)

    print(f"Scanning {len(eligible_files)} JSON files (excluded {len(json_files) - len(eligible_files)} protected files)\n")

    totals = defaultdict(int)
    all_still_vague = []
    per_file_stats = []

    for filepath in eligible_files:
        stats = process_file(filepath, dry_run=dry_run)
        if stats['vague_found'] > 0:
            per_file_stats.append((os.path.basename(filepath), stats))
            for key in ['vague_found', 'enriched', 'year_only', 'still_vague', 'already_ok']:
                totals[key] += stats[key]
            all_still_vague.extend(stats['still_vague_entries'])

    # Report
    print("=" * 70)
    print("SUMMARY")
    print("=" * 70)
    print(f"  Vague sources found:        {totals['vague_found']:,}")
    print(f"  Enriched (category + year):  {totals['enriched']:,}")
    print(f"  Year only added:             {totals['year_only']:,}")
    print(f"  Already had context:         {totals['already_ok']:,}")
    print(f"  Still vague (no year/cat):   {totals['still_vague']:,}")
    print(f"  Total improved:              {totals['enriched'] + totals['year_only']:,}")
    print()

    if per_file_stats and verbose:
        print("-" * 70)
        print("PER-FILE BREAKDOWN")
        print("-" * 70)
        for filename, stats in sorted(per_file_stats, key=lambda x: -x[1]['vague_found']):
            print(f"  {filename}")
            print(f"    found: {stats['vague_found']}, enriched: {stats['enriched']}, "
                  f"year_only: {stats['year_only']}, still_vague: {stats['still_vague']}")
        print()

    if all_still_vague:
        print("-" * 70)
        print(f"STILL VAGUE ({len(all_still_vague)} entries — need manual sourcing)")
        print("-" * 70)
        for entry in all_still_vague[:30]:
            print(f"  [{entry['file']}] {entry['id']}: {entry['metric']}")
        if len(all_still_vague) > 30:
            print(f"  ... and {len(all_still_vague) - 30} more")
        print()

    action = "Would be improved" if dry_run else "Improved"
    print(f"{action}: {totals['enriched'] + totals['year_only']:,} / {totals['vague_found']:,} vague entries")
    if dry_run:
        print("\nRun without --dry-run to apply changes.")


if __name__ == '__main__':
    main()
