"""
Sacred Text Backtest Engine

Takes resolved Polymarket markets, runs them through the Simulator v2,
and compares the simulator's sacred-text-based prediction vs actual outcome.

Flow:
1. Load resolved markets from data/resolved_markets.json
2. For each market question, call Simulator API (/api/generate)
3. Extract prediction: count outcome-good vs outcome-bad nodes
4. Compare with actual Polymarket resolution
5. Track hit rate, edge, and theoretical P&L
"""
import json
import sys
import time
import traceback
from datetime import datetime
from pathlib import Path
from typing import Any, Optional

import requests

# Force unbuffered output
sys.stdout.reconfigure(line_buffering=True)
sys.stderr.reconfigure(line_buffering=True)

SIMULATOR_API = "http://localhost:3001/api/generate"
DATA_DIR = Path(__file__).parent / "data"
RESULTS_DIR = Path(__file__).parent / "results"
RESULTS_DIR.mkdir(exist_ok=True)


def load_resolved_markets() -> list[dict]:
    """Load resolved markets from JSON."""
    path = DATA_DIR / "resolved_markets.json"
    if not path.exists():
        print("ERROR: Run fetch_resolved.py first!")
        sys.exit(1)
    with open(path) as f:
        return json.load(f)


def call_simulator(question: str, sacred_mode: bool = True) -> Optional[dict]:
    """
    Call the Simulator v2 API with a Polymarket question.
    Returns the generated flow (nodes + edges) or None on error.
    """
    try:
        resp = requests.post(
            SIMULATOR_API,
            json={
                "scenario": question,
                "sacredMode": sacred_mode,
                "tags": {"timeframe": "medium"},
            },
            timeout=60,
        )
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        print(f"  Simulator error: {e}")
        return None


def extract_prediction(flow: dict) -> dict:
    """
    Extract prediction from simulator flow.

    Strategy:
    - Count outcome-good vs outcome-bad nodes
    - Look at the probability path to each outcome
    - Calculate weighted success rate based on node probabilities

    Returns:
        {
            "yes_prob": float,  # probability of positive outcome (0-1)
            "no_prob": float,   # probability of negative outcome (0-1)
            "confidence": float,  # how confident the model is
            "reasoning": str,   # key nodes/factors
            "n_good": int,
            "n_bad": int,
            "n_total": int,
        }
    """
    nodes = flow.get("nodes", [])
    edges = flow.get("edges", [])

    if not nodes:
        return {"yes_prob": 0.5, "no_prob": 0.5, "confidence": 0, "reasoning": "No nodes", "n_good": 0, "n_bad": 0, "n_total": 0}

    # Count outcome nodes
    good_nodes = [n for n in nodes if n.get("type") == "outcome-good"]
    bad_nodes = [n for n in nodes if n.get("type") == "outcome-bad"]
    bottleneck_nodes = [n for n in nodes if n.get("type") in ("bottleneck", "gate")]

    # Calculate path probabilities
    # For each bottleneck, the probability represents the pass rate
    # The cumulative probability to reach good vs bad outcomes gives us the prediction

    # Simple approach: use the average bottleneck probability
    # This represents the "survival rate" through the system
    if bottleneck_nodes:
        avg_prob = sum(n.get("prob", 50) for n in bottleneck_nodes) / len(bottleneck_nodes)
    else:
        avg_prob = 50

    # Weight by number of good vs bad outcomes
    n_good = len(good_nodes)
    n_bad = len(bad_nodes)
    n_total = n_good + n_bad

    if n_total == 0:
        yes_prob = avg_prob / 100
    else:
        # Base probability from bottlenecks, adjusted by outcome ratio
        outcome_ratio = n_good / n_total
        yes_prob = (avg_prob / 100) * 0.6 + outcome_ratio * 0.4

    # Clamp
    yes_prob = max(0.01, min(0.99, yes_prob))

    # Confidence based on data quality
    sources = [n.get("source", "") for n in nodes if n.get("source")]
    has_real_sources = sum(1 for s in sources if any(x in s.lower() for x in ["bls", "mckinsey", "world bank", "pew", "gallup", "reuters"]))
    confidence = min(1.0, has_real_sources / max(1, len(nodes)) * 3)

    # Key reasoning
    key_bottlenecks = sorted(bottleneck_nodes, key=lambda n: n.get("prob", 50))[:3]
    reasoning = " | ".join(f"{n.get('label', '?')} ({n.get('prob', '?')}%)" for n in key_bottlenecks)

    return {
        "yes_prob": round(yes_prob, 4),
        "no_prob": round(1 - yes_prob, 4),
        "confidence": round(confidence, 3),
        "reasoning": reasoning,
        "n_good": n_good,
        "n_bad": n_bad,
        "n_total": n_total,
    }


def run_backtest(events: list[dict], max_markets: int = 50, sacred_mode: bool = True) -> list[dict]:
    """
    Run backtest on resolved markets.

    For each market:
    1. Call simulator with the question
    2. Extract prediction
    3. Compare with actual resolution
    4. Calculate edge and P&L
    """
    results = []
    processed = 0

    for event in events:
        if processed >= max_markets:
            break

        # IMPORTANT: Only take 1 market per event to avoid bias
        # For multi-candidate events (elections, championships), pick the WINNER market
        # For single-question events, pick the main market
        markets = event.get("markets", [])
        binary_markets = [m for m in markets if len(m.get("outcomes", [])) == 2 and m.get("winner")]

        if not binary_markets:
            continue

        # If event has many sub-markets (e.g. "Will X win election?" x17 candidates),
        # pick the one where winner="Yes" (the actual winner) — that's the interesting question
        # If no "Yes" winner, pick the highest volume market
        yes_winners = [m for m in binary_markets if m.get("winner") == "Yes"]
        if yes_winners:
            market = max(yes_winners, key=lambda m: m.get("volume", 0))
        else:
            # Single binary event — take the highest volume
            market = max(binary_markets, key=lambda m: m.get("volume", 0))

        question = market.get("question", "")
        winner = market.get("winner")
        outcomes = market.get("outcomes", [])
        volume = market.get("volume", 0)
        slug = market.get("slug", "")

        if not question or not winner or not outcomes:
            continue

        print(f"\n[{processed + 1}/{max_markets}] {question[:70]}...")
        print(f"  Actual winner: {winner}")
        print(f"  Event: {event.get('title', '?')[:50]} (${event.get('volume', 0):,.0f} vol)")

        # Call simulator
        flow = call_simulator(question, sacred_mode=sacred_mode)
        if not flow:
            continue

        # Extract prediction
        prediction = extract_prediction(flow)

        # Map prediction to market outcomes
        # The simulator predicts "yes/success" probability
        # In binary markets: outcomes[0] is usually "Yes", outcomes[1] is "No"
        sim_yes_prob = prediction["yes_prob"]

        # Did the simulator agree with the actual outcome?
        actual_is_yes = winner == outcomes[0] if outcomes else True
        sim_predicted_yes = sim_yes_prob > 0.5
        correct = sim_predicted_yes == actual_is_yes

        # Calculate edge
        # If we bet on our prediction at 50c (even money), what's the P&L?
        if correct:
            pnl = sim_yes_prob if actual_is_yes else (1 - sim_yes_prob)
        else:
            pnl = -(sim_yes_prob if not actual_is_yes else (1 - sim_yes_prob))

        result = {
            "question": question,
            "slug": slug,
            "category": event.get("category", market.get("category", "")),
            "volume": volume,
            "event_volume": event.get("volume", 0),
            "event_title": event.get("title", ""),
            "outcomes": outcomes,
            "winner": winner,
            "actual_is_yes": actual_is_yes,
            "sim_yes_prob": sim_yes_prob,
            "sim_predicted_yes": sim_predicted_yes,
            "correct": correct,
            "confidence": prediction["confidence"],
            "reasoning": prediction["reasoning"],
            "n_good_outcomes": prediction["n_good"],
            "n_bad_outcomes": prediction["n_bad"],
            "pnl": round(pnl, 4),
            "end_date": market.get("end_date", ""),
        }
        results.append(result)
        processed += 1

        status = "HIT" if correct else "MISS"
        print(f"  Sim prediction: {'Yes' if sim_predicted_yes else 'No'} ({sim_yes_prob:.1%})")
        print(f"  Result: {status} | P&L: {pnl:+.2%} | Confidence: {prediction['confidence']:.1%}")

        # Rate limit
        time.sleep(1.5)

    return results


def print_summary(results: list[dict]):
    """Print backtest summary with category breakdown."""
    if not results:
        print("\nNo results to analyze.")
        return

    total = len(results)
    hits = sum(1 for r in results if r["correct"])
    hit_rate = hits / total
    avg_pnl = sum(r["pnl"] for r in results) / total
    avg_confidence = sum(r["confidence"] for r in results) / total

    print("\n" + "=" * 80)
    print("SACRED TEXT BACKTEST RESULTS")
    print("=" * 80)
    print(f"\nTotal markets:    {total}")
    print(f"Correct:          {hits} ({hit_rate:.1%})")
    print(f"Wrong:            {total - hits} ({1 - hit_rate:.1%})")
    print(f"Avg P&L:          {avg_pnl:+.2%}")
    print(f"Avg Confidence:   {avg_confidence:.1%}")

    # Category breakdown
    cats: dict[str, list] = {}
    for r in results:
        cat = r.get("category", "Unknown") or "Unknown"
        cats.setdefault(cat, []).append(r)

    print(f"\n{'Category':25} | {'N':>4} | {'Hit%':>6} | {'Avg P&L':>8} | {'Conf':>6}")
    print("-" * 70)
    for cat in sorted(cats, key=lambda c: -len(cats[c])):
        cat_results = cats[cat]
        n = len(cat_results)
        h = sum(1 for r in cat_results if r["correct"])
        hr = h / n if n else 0
        ap = sum(r["pnl"] for r in cat_results) / n if n else 0
        ac = sum(r["confidence"] for r in cat_results) / n if n else 0
        edge_marker = " <-- EDGE" if hr > 0.55 and n >= 3 else ""
        print(f"{cat:25} | {n:>4} | {hr:>5.1%} | {ap:>+7.2%} | {ac:>5.1%}{edge_marker}")

    # Best individual predictions
    sorted_by_pnl = sorted(results, key=lambda r: r["pnl"], reverse=True)
    print(f"\nTop 5 best predictions:")
    for r in sorted_by_pnl[:5]:
        q = r["question"][:50]
        print(f"  {r['pnl']:+.2%} | {r['sim_yes_prob']:.0%} sim vs actual={'Yes' if r['actual_is_yes'] else 'No'} | {q}")

    print(f"\nTop 5 worst predictions:")
    for r in sorted_by_pnl[-5:]:
        q = r["question"][:50]
        print(f"  {r['pnl']:+.2%} | {r['sim_yes_prob']:.0%} sim vs actual={'Yes' if r['actual_is_yes'] else 'No'} | {q}")


def main():
    print("=" * 60)
    print("SACRED TEXT POLYMARKET BACKTEST")
    print("=" * 60)

    # Load resolved markets
    events = load_resolved_markets()
    print(f"Loaded {len(events)} resolved events")

    # Count available binary markets
    binary_count = 0
    for e in events:
        for m in e.get("markets", []):
            if len(m.get("outcomes", [])) == 2 and m.get("winner"):
                binary_count += 1
    print(f"Binary markets with winner: {binary_count}")

    # Run backtest
    max_markets = int(sys.argv[1]) if len(sys.argv) > 1 else 10
    print(f"\nRunning backtest on {max_markets} markets...")
    print("(Calling Simulator API for each — this takes ~{} minutes)".format(max_markets * 3 // 60 + 1))

    results = run_backtest(events, max_markets=max_markets)

    # Save results
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    results_file = RESULTS_DIR / f"backtest_{timestamp}.json"
    with open(results_file, "w") as f:
        json.dump(results, f, indent=2)
    print(f"\nResults saved to {results_file}")

    # Print summary
    print_summary(results)


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"\nFATAL ERROR: {e}")
        traceback.print_exc()
        sys.exit(1)
