"""
Batch prediction example -- predict multiple scenarios.
Run: python -m simulator_sdk.examples.batch
"""
from simulator_sdk import SimulatorClient, RateLimitError


def main():
    client = SimulatorClient()

    scenarios = [
        {"scenario": "Start a food truck in Austin, Texas", "country": "USA", "budget": 30000},
        {"scenario": "Launch a B2B SaaS for inventory management", "budget": 100000, "timeline": "18 months"},
        {"scenario": "Open a yoga studio in Bali", "country": "Indonesia", "budget": 15000, "timeline": "6 months"},
    ]

    print(f"Predicting {len(scenarios)} scenarios...\n")

    results = client.predict_batch(scenarios)

    for item in results:
        params = item["params"]
        result = item["result"]
        error = item["error"]

        print(f"--- {params['scenario']} ---")
        if result:
            print(f"  Probability: {result.probability}%")
            print(f"  Confidence: {result.confidence}")
            print(f"  Bottlenecks: {len(result.key_bottlenecks)}")
        elif isinstance(error, RateLimitError):
            print(f"  Rate limited. Retry after: {error.retry_after}s")
        elif error:
            print(f"  Error: {error}")
        print()


if __name__ == "__main__":
    main()
