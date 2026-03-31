#!/usr/bin/env python3
"""Add BLS URLs to all bls-*.json and bulk-bls-*.json files."""

import json
import os

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data')

# File name -> BLS URL mapping
FILE_URL_MAP = {
    'bls-cpi-inflation.json': 'https://www.bls.gov/cpi/',
    'bls-employment.json': 'https://www.bls.gov/ces/',
    'bls-occupational-employment.json': 'https://www.bls.gov/oes/',
    'bls-ppi-producer-prices.json': 'https://www.bls.gov/ppi/',
    'bls-productivity.json': 'https://www.bls.gov/lpc/',
    'bls-unemployment.json': 'https://www.bls.gov/cps/',
    'bls-wages-earnings.json': 'https://www.bls.gov/ces/',
}

# For bulk file: series prefix -> URL mapping
SERIES_URL_MAP = {
    'CES': 'https://www.bls.gov/ces/',
    'CUUR': 'https://www.bls.gov/cpi/',
    'CUSR': 'https://www.bls.gov/cpi/',
    'LNS': 'https://www.bls.gov/cps/',
    'PRS': 'https://www.bls.gov/lpc/',
    'WPU': 'https://www.bls.gov/ppi/',
    'PCU': 'https://www.bls.gov/ppi/',
    'OEU': 'https://www.bls.gov/oes/',
}

def get_url_for_series(series_id):
    """Determine BLS URL from series ID prefix."""
    for prefix, url in SERIES_URL_MAP.items():
        if series_id.startswith(prefix):
            return url
    return 'https://www.bls.gov/data/'

def get_year(dp):
    """Extract year from data point (handles both 'year' and 'date' fields)."""
    if 'year' in dp:
        return dp['year']
    if 'date' in dp:
        return dp['date'].split('-')[0]
    return None

def update_source(dp):
    """Ensure source includes BLS and year."""
    year = get_year(dp)
    if year:
        dp['source'] = f"BLS {year}"
    else:
        dp['source'] = 'BLS'

def process_file(filepath, filename):
    """Process a single BLS JSON file."""
    with open(filepath, 'r') as f:
        data = json.load(f)

    count = len(data)

    for dp in data:
        # Add URL
        if filename in FILE_URL_MAP:
            dp['url'] = FILE_URL_MAP[filename]
        else:
            # bulk file - determine from series ID
            series_id = dp.get('series', dp.get('series_id', ''))
            dp['url'] = get_url_for_series(series_id)

        # Update source with year
        update_source(dp)

    with open(filepath, 'w') as f:
        json.dump(data, f, indent=2)

    return count

def main():
    total = 0
    files_processed = 0

    for filename in sorted(os.listdir(DATA_DIR)):
        if filename.startswith('bls-') or filename.startswith('bulk-bls-'):
            if filename.endswith('.json'):
                filepath = os.path.join(DATA_DIR, filename)
                count = process_file(filepath, filename)
                print(f"  {filename}: {count} data points updated")
                total += count
                files_processed += 1

    print(f"\nDone: {files_processed} files, {total} data points updated with URLs and source+year")

if __name__ == '__main__':
    main()
