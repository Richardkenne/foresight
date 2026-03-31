#!/usr/bin/env python3
"""Update all JSON data files with exact report URLs."""

import json
import glob
import os
from collections import defaultdict

EXACT_URLS = {
    "CB Insights": "https://www.cbinsights.com/research/report/startup-failure-reasons-top/",
    "McKinsey": "https://www.mckinsey.com/capabilities/quantumblack/our-insights/the-state-of-ai-2024",
    "PitchBook": "https://pitchbook.com/news/reports/q4-2024-pitchbook-nvca-venture-monitor",
    "Statista": "https://www.statista.com/topics/1002/mobile-app-usage/",
    "Pew Research": "https://www.pewresearch.org/internet/2021/12/08/the-state-of-gig-work-in-2021/",
    "Gallup": "https://www.gallup.com/workplace/349484/state-of-the-global-workplace.aspx",
    "Gartner": "https://www.gartner.com/en/newsroom/press-releases/2024-08-21-gartner-2024-hype-cycle-for-emerging-technologies-highlights-developer-productivity-total-experience-ai-and-security",
    "WordStream": "https://www.wordstream.com/blog/2024-google-ads-benchmarks",
    "First Page Sage": "https://firstpagesage.com/seo-blog/conversion-rate-benchmarks/",
    "MailerLite": "https://www.mailerlite.com/blog/compare-your-email-performance-metrics-industry-benchmarks",
    "APA": "https://www.apa.org/pubs/reports/stress-in-america/2024",
    "CDC": "https://www.cdc.gov/nchs/products/nhsr.htm",
    "WHO": "https://www.who.int/publications/i/item/9789240094703",
    "NRA": "https://restaurant.org/research-and-media/research/research-reports/",
    "National Restaurant": "https://restaurant.org/research-and-media/research/research-reports/",
    "Census Bureau": "https://www.census.gov/programs-surveys/abs.html",
    "IRS": "https://www.irs.gov/statistics/soi-tax-stats-statistics-of-income",
    "OECD": "https://www.oecd.org/en/publications/oecd-employment-outlook-2024_ac8b3538-en.html",
    "Grand View Research": "https://www.grandviewresearch.com",
    "Numbeo": "https://www.numbeo.com/cost-of-living/rankings.jsp?title=2024",
    "Startup Genome": "https://startupgenome.com/report/gser2024",
    "Upwork": "https://www.upwork.com/research/future-workforce-index-2025",
    "Payoneer": "https://www.payoneer.com/resources/business/the-payoneer-2023-freelancer-insights-report/",
    "SignalFire": "https://www.signalfire.com/blog/creator-economy",
    "Linktree": "https://linktr.ee/s/reports/creator-commerce-report-24",
    "Baremetrics": "https://baremetrics.com/open-benchmarks",
    "Indie Hackers": "https://www.indiehackers.com/group/income-reports",
    "AppsFlyer": "https://www.appsflyer.com/resources/reports/ecommerce-app-marketing-2024-report/",
    "Sensor Tower": "https://sensortower.com/state-of-mobile-2024",
    "SaaStr": "https://www.saastr.com/2024-state-of-saas-with-saastr-ceo-and-founder-jason-lemkin/",
    "Forrester": "https://www.forrester.com/predictions/predictions-2024/",
    "Harvard Business Review": "https://hbr.org/2024/05/highly-skilled-professionals-want-your-work-but-not-your-job",
    "HBR": "https://hbr.org/2024/05/highly-skilled-professionals-want-your-work-but-not-your-job",
    "MBO Partners": "https://www.mbopartners.com/state-of-independence/2024-report/",
    "Noam Wasserman": "https://hbr.org/2008/02/the-founders-dilemma",
    "Y Combinator": "https://www.ycombinator.com/library/9u-why-do-startups-fail",
    "YC": "https://www.ycombinator.com/library/9u-why-do-startups-fail",
    "Lenny Rachitsky": "https://www.lennysnewsletter.com/p/what-is-good-retention-issue-29",
    "ProfitWell": "https://www.profitwell.com/blog/average-churn-rate",
    "First Round": "https://first-round-capital.relayto.com/e/state-of-startups-first-round-5d0ca895ce1f2",
    "Bessemer": "https://www.bvp.com/atlas/state-of-the-cloud-2024",
    "Toast": "https://pos.toasttab.com/news/the-cost-of-going-out-to-lunch",
    "Clutch": "https://clutch.co/directory/mobile-application-developers/pricing",
    "Bankrate": "https://www.bankrate.com/credit-cards/news/side-hustles-survey-2024/",
    "FreshBooks": "https://www.freshbooks.com/press/releases/freshbooks-uncovers-fresh-insights-with-its-2024-report-on-the-state-of-small-businesses",
    "Social Blade": "https://socialblade.com/",
    "Goldman Sachs": "https://www.goldmansachs.com/insights/articles/the-creator-economy-could-approach-half-a-trillion-dollars-by-2027",
    "GEM": "https://www.gemconsortium.org/report/global-entrepreneurship-monitor-gem-20232024-global-report-25-years-and-growing",
    "Global Entrepreneurship Monitor": "https://www.gemconsortium.org/report/global-entrepreneurship-monitor-gem-20232024-global-report-25-years-and-growing",
    "Startup Snapshot": "https://www.startupsnapshot.com/research/the-untold-toll-the-impact-of-stress-on-the-well-being-of-startup-founders-and-ceos/",
    "Fiverr": "https://investors.fiverr.com/news-releases/news-release-details/fiverr-announces-fourth-quarter-and-full-year-2024-results",
    "BuildFire": "https://buildfire.com/app-statistics/",
    "AppFollow": "https://appfollow.io/blog/appfollow-benchmark-what-is-it-about",
    "MicroConf": "https://microconf.com/state-of-indie-saas",
    "Lean Startup": "https://theleanstartup.com/principles",
    "Mom Test": "https://www.momtestbook.com/",
    "Zapier": "https://zapier.com/blog/side-hustle-report-2022/",
}

# URLs to never touch (already exact)
PROTECTED_PATTERNS = ["data.worldbank.org/indicator", "bls.gov/", "eurostat"]

DATA_DIR = "/Users/richardbotsiokennedy/Simulator/v2/data"


def match_source(source_value):
    """Case-insensitive partial match of source field against EXACT_URLS keys."""
    if not isinstance(source_value, str):
        return None
    source_lower = source_value.lower()
    for key, url in EXACT_URLS.items():
        if key.lower() in source_lower:
            return url
    return None


def is_protected(url):
    """Check if URL should not be modified."""
    if not url:
        return False
    for pattern in PROTECTED_PATTERNS:
        if pattern in url:
            return True
    return False


def process_item(item, stats, filename):
    """Process a single data point dict. Returns True if modified."""
    if not isinstance(item, dict):
        return False
    if "source" not in item:
        return False

    source = item["source"]
    exact_url = match_source(source)
    if not exact_url:
        return False

    existing_url = item.get("url")

    # Skip protected URLs
    if is_protected(existing_url):
        return False

    # Skip if already has the exact URL
    if existing_url == exact_url:
        return False

    # Update or add URL
    item["url"] = exact_url

    # Find which key matched for stats
    source_lower = source.lower()
    for key in EXACT_URLS:
        if key.lower() in source_lower:
            stats[key] += 1
            break

    return True


def walk_and_update(obj, stats, filename):
    """Recursively walk JSON and update data points with source fields."""
    count = 0
    if isinstance(obj, dict):
        # Check if this dict itself is a data point
        if "source" in obj and ("metric" in obj or "value" in obj or "stat" in obj or "fact" in obj or "description" in obj or "insight" in obj or "text" in obj):
            if process_item(obj, stats, filename):
                count += 1
        # Recurse into values
        for v in obj.values():
            count += walk_and_update(v, stats, filename)
    elif isinstance(obj, list):
        for item in obj:
            count += walk_and_update(item, stats, filename)
    return count


def main():
    files = sorted(glob.glob(os.path.join(DATA_DIR, "*.json")))
    print(f"Found {len(files)} JSON files\n")

    total_updated = 0
    files_modified = 0
    stats = defaultdict(int)
    file_details = []

    for filepath in files:
        filename = os.path.basename(filepath)
        try:
            with open(filepath, "r") as f:
                data = json.load(f)
        except (json.JSONDecodeError, Exception) as e:
            print(f"  SKIP {filename}: {e}")
            continue

        count = walk_and_update(data, stats, filename)

        if count > 0:
            with open(filepath, "w") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
                f.write("\n")
            files_modified += 1
            total_updated += count
            file_details.append((filename, count))
            print(f"  UPDATED {filename}: {count} data points")

    print(f"\n{'='*60}")
    print(f"RESULTS")
    print(f"{'='*60}")
    print(f"Total files scanned:  {len(files)}")
    print(f"Files modified:       {files_modified}")
    print(f"Total data points updated: {total_updated}")
    print(f"\n--- Breakdown by source ---")
    for source, count in sorted(stats.items(), key=lambda x: -x[1]):
        print(f"  {source:30s} {count:5d}")
    print(f"\n--- Files modified ---")
    for fname, count in sorted(file_details, key=lambda x: -x[1]):
        print(f"  {fname:50s} {count:5d}")


if __name__ == "__main__":
    main()
