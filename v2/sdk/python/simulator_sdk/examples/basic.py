"""
Basic prediction example.
Run: python -m simulator_sdk.examples.basic
"""
from simulator_sdk import SimulatorClient, SimulatorError


def main():
    client = SimulatorClient(base_url="https://simulator.vercel.app")

    try:
        result = client.predict(
            scenario="Launch a mobile app for language learning targeting Southeast Asia",
        )

        print("--- Prediction Result ---")
        print(f"Scenario: {result.scenario}")
        print(f"Probability: {result.probability}%")
        print(f"Confidence: {result.confidence}")
        print(
            f"Range: {result.prob_range['adverse']}% (adverse) "
            f"- {result.prob_range['optimistic']}% (optimistic)"
        )
        print()
        print("Key Bottlenecks:")
        for b in result.key_bottlenecks:
            print(f"  [{b.prob}%] {b.label} -- {b.description}")
        print()
        print("Sources:", ", ".join(result.sources))
        print("Sacred Roots:", ", ".join(result.sacred_roots))
        print("Generated at:", result.generated_at)

    except SimulatorError as e:
        print(f"API Error ({e.status_code}): {e}")


if __name__ == "__main__":
    main()
