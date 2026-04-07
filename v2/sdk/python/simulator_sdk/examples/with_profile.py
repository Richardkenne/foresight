"""
Prediction with full country/budget/timeline context.
Run: python -m simulator_sdk.examples.with_profile
"""
from simulator_sdk import SimulatorClient, RateLimitError, ValidationError


def main():
    client = SimulatorClient(
        base_url="https://simulator.vercel.app",
        timeout=60,  # longer timeout for complex scenarios
    )

    try:
        result = client.predict(
            scenario="Build a fintech startup offering micro-loans to small businesses",
            country="Nigeria",
            budget=250000,
            timeline="2 years",
        )

        print("=== PREDICTION ===")
        print(f"Scenario: {result.scenario}")
        print(f"Overall probability: {result.probability}%")
        print(f"Confidence in data: {result.confidence * 100:.0f}%")
        print(f"Best case: {result.prob_range['optimistic']}%")
        print(f"Worst case: {result.prob_range['adverse']}%")
        print()

        print("=== BOTTLENECKS ===")
        for b in result.key_bottlenecks:
            bar = "#" * round(b.prob / 5)
            print(f"  {b.label:<25} [{b.prob:>3}%] {bar}")
            print(f"  {'':25} {b.description}")
        print()

        print("=== DATA SOURCES ===")
        for s in result.sources:
            print(f"  - {s}")
        print()

        print("=== SACRED ROOTS ===")
        for r in result.sacred_roots:
            print(f"  - {r}")

        if result.meta:
            print(f"\n[Provider: {result.meta.get('provider')}, Data: {result.meta.get('dataSource')}]")

    except ValidationError as e:
        print(f"Validation failed: {e}")
    except RateLimitError as e:
        print(f"Rate limited. Reset at: {e.reset_at.isoformat()}")
    except Exception as e:
        print(f"Error: {e}")


if __name__ == "__main__":
    main()
