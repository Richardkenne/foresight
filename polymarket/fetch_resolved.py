"""
Fetch resolved Polymarket markets by category.
Filters for human-behavior-driven markets where sacred text patterns apply.
"""
import json
import sys
import time
from datetime import datetime
from pathlib import Path
from typing import Any

import requests

GAMMA_API = "https://gamma-api.polymarket.com"
OUT_DIR = Path(__file__).parent / "data"
OUT_DIR.mkdir(exist_ok=True)

# Categories where sacred text / human behavior patterns have edge
SACRED_CATEGORIES = [
    # Behavior-driven: leader hubris, crowd bias, power dynamics
    "politics", "geopolitics", "elections", "global-politics",
    "us-current-affairs", "economy", "business",
]

# Keywords to filter for behavior-driven markets (vs pure random/sport)
BEHAVIOR_KEYWORDS = [
    "president", "election", "win", "leader", "prime minister",
    "war", "strike", "shutdown", "resign", "impeach", "ban",
    "fed", "interest rate", "inflation", "recession",
    "supreme", "court", "congress", "senate", "parliament",
    "dictator", "regime", "sanction", "peace", "ceasefire",
    "approval", "poll", "vote", "nominee", "candidate",
]

# Keywords to exclude (not behavior-driven)
EXCLUDE_KEYWORDS = [
    "price of", "floor price", "tvl", "market cap",
    "temperature", "weather", "earthquake",
    "nba", "nfl", "nhl", "mlb", "tennis", "f1", "ufc",
    "poker", "chess", "esports",
    "movie", "oscar", "grammy", "emmy",
    "updown", "btc-", "eth-", "sol-",
]


def is_behavior_market(title: str) -> bool:
    """Check if market is driven by human behavior (not random/price/sport)."""
    title_lower = title.lower()
    # Exclude non-behavior markets
    for kw in EXCLUDE_KEYWORDS:
        if kw in title_lower:
            return False
    # Include if it has behavior keywords OR doesn't match exclusions
    for kw in BEHAVIOR_KEYWORDS:
        if kw in title_lower:
            return True
    # Default: include if not excluded (might be interesting)
    return True


def fetch_resolved_events(limit: int = 200, min_volume: float = 50_000) -> list[dict[str, Any]]:
    """Fetch resolved events sorted by volume, filtered for behavior markets."""
    all_events = []
    offset = 0
    batch_size = 50

    while offset < limit:
        try:
            resp = requests.get(
                f"{GAMMA_API}/events",
                params={
                    "closed": "true",
                    "limit": batch_size,
                    "offset": offset,
                    "order": "volume",
                    "ascending": "false",
                },
                timeout=15,
            )
            resp.raise_for_status()
            events = resp.json()
        except Exception as e:
            print(f"Error fetching offset={offset}: {e}")
            break

        if not events:
            break

        for event in events:
            title = event.get("title", "")
            volume = event.get("volume", 0) or 0

            if volume < min_volume:
                continue
            if not is_behavior_market(title):
                continue

            # Extract market details
            markets = event.get("markets", [])
            resolved_markets = []
            for m in markets:
                outcomes_raw = m.get("outcomes", "[]")
                prices_raw = m.get("outcomePrices", "[]")
                try:
                    outcomes = json.loads(outcomes_raw) if isinstance(outcomes_raw, str) else (outcomes_raw or [])
                    prices = json.loads(prices_raw) if isinstance(prices_raw, str) else (prices_raw or [])
                except Exception:
                    continue

                if not outcomes or not prices:
                    continue

                # Find winner
                winner = None
                winner_price = 0
                for i, p in enumerate(prices):
                    try:
                        pf = float(p)
                        if pf >= 0.99:
                            winner = outcomes[i]
                            winner_price = pf
                    except (ValueError, TypeError):
                        pass

                resolved_markets.append({
                    "question": m.get("question", ""),
                    "slug": m.get("slug", ""),
                    "outcomes": outcomes,
                    "outcome_prices": [float(p) for p in prices],
                    "winner": winner,
                    "volume": m.get("volumeNum", 0),
                    "end_date": m.get("endDateIso", ""),
                    "category": m.get("category", ""),
                })

            if resolved_markets:
                all_events.append({
                    "title": title,
                    "category": event.get("category", ""),
                    "volume": volume,
                    "end_date": event.get("endDate", ""),
                    "markets": resolved_markets,
                    "n_markets": len(resolved_markets),
                })

        offset += batch_size
        time.sleep(0.3)  # Rate limit

    return all_events


def main():
    print("Fetching resolved behavior-driven markets from Polymarket...")
    events = fetch_resolved_events(limit=500, min_volume=50_000)

    # Sort by volume
    events.sort(key=lambda e: e["volume"], reverse=True)

    # Save
    out_file = OUT_DIR / "resolved_markets.json"
    with open(out_file, "w") as f:
        json.dump(events, f, indent=2, default=str)

    # Summary
    print(f"\nFound {len(events)} behavior-driven resolved events")
    print(f"Saved to {out_file}\n")

    # Category breakdown
    cats: dict[str, int] = {}
    for e in events:
        cat = e.get("category") or "Unknown"
        cats[cat] = cats.get(cat, 0) + 1

    print("Category breakdown:")
    for cat, count in sorted(cats.items(), key=lambda x: -x[1]):
        print(f"  {cat:25} {count:>4} events")

    # Top 20 by volume
    print(f"\nTop 20 by volume:")
    print(f"{'Volume':>15} | {'Cat':20} | {'Title':60}")
    print("-" * 100)
    for e in events[:20]:
        vol = f"${e['volume']:,.0f}"
        cat = (e.get('category') or '?')[:20]
        title = e['title'][:60]
        print(f"{vol:>15} | {cat:20} | {title}")


if __name__ == "__main__":
    main()
