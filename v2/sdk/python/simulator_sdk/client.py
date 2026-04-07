"""Simulator Prediction API client."""

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Union

import requests

from .errors import SimulatorError, ValidationError, RateLimitError, ServerError


@dataclass
class Bottleneck:
    """A critical gate in the prediction."""

    label: str
    prob: float
    description: str


@dataclass
class RateLimitInfo:
    """Rate limit information from response headers."""

    limit: int
    remaining: int
    reset_at: datetime


@dataclass
class PredictionResult:
    """Result of a scenario prediction."""

    scenario: str
    probability: float
    confidence: float
    prob_range: Dict[str, float]
    key_bottlenecks: List[Bottleneck]
    sources: List[str]
    sacred_roots: List[str]
    generated_at: str
    meta: Optional[Dict[str, Any]] = None


class SimulatorClient:
    """Client for the Simulator Prediction API.

    Args:
        base_url: Base URL of the API. Defaults to https://simulator.vercel.app
        api_key: API key for authenticated requests (future feature).
        timeout: Request timeout in seconds. Defaults to 30.
    """

    def __init__(
        self,
        base_url: Optional[str] = None,
        api_key: Optional[str] = None,
        timeout: int = 30,
    ):
        self.base_url = (base_url or "https://simulator.vercel.app").rstrip("/")
        self.api_key = api_key
        self.timeout = timeout
        self._session = requests.Session()
        self._session.headers.update({"Content-Type": "application/json"})
        if api_key:
            self._session.headers.update({"Authorization": f"Bearer {api_key}"})

    def predict(
        self,
        scenario: str,
        country: Optional[str] = None,
        budget: Optional[float] = None,
        timeline: Optional[str] = None,
    ) -> PredictionResult:
        """Predict the probability of success for a scenario.

        Args:
            scenario: The scenario to predict. Max 2000 characters.
            country: Target country for location-specific data.
            budget: Available budget in USD.
            timeline: Target timeline (e.g. "6 months", "2 years").

        Returns:
            PredictionResult with probabilities, bottlenecks, and sources.

        Raises:
            ValidationError: If input is invalid (400).
            RateLimitError: If rate limit exceeded (429).
            ServerError: If server error (500).
            SimulatorError: For other errors.
        """
        # Client-side validation
        if not scenario or not scenario.strip():
            raise ValidationError("Scenario is required and must be a non-empty string.")
        if len(scenario) > 2000:
            raise ValidationError("Scenario must be 2000 characters or fewer.")

        body: Dict[str, Any] = {"scenario": scenario.strip()}
        if country is not None:
            body["country"] = country
        if budget is not None:
            body["budget"] = budget
        if timeline is not None:
            body["timeline"] = timeline

        try:
            response = self._session.post(
                f"{self.base_url}/api/predict",
                json=body,
                timeout=self.timeout,
            )
        except requests.exceptions.Timeout:
            raise SimulatorError(f"Request timed out after {self.timeout}s")
        except requests.exceptions.ConnectionError as e:
            raise SimulatorError(f"Connection error: {e}")
        except requests.exceptions.RequestException as e:
            raise SimulatorError(f"Request failed: {e}")

        try:
            data = response.json()
        except ValueError:
            raise SimulatorError(
                f"Invalid JSON response (HTTP {response.status_code})",
                status_code=response.status_code,
            )

        if not response.ok:
            message = data.get("error", f"HTTP {response.status_code}") if isinstance(data, dict) else f"HTTP {response.status_code}"

            if response.status_code == 400:
                raise ValidationError(message, body=data)

            if response.status_code == 429:
                reset_header = response.headers.get("X-RateLimit-Reset")
                retry_header = response.headers.get("Retry-After")
                reset_at = (
                    datetime.fromtimestamp(int(reset_header), tz=timezone.utc)
                    if reset_header
                    else datetime.now(tz=timezone.utc)
                )
                retry_after = int(retry_header) if retry_header else 0
                raise RateLimitError(message, reset_at=reset_at, retry_after=retry_after, body=data)

            if response.status_code >= 500:
                raise ServerError(message, body=data)

            raise SimulatorError(message, status_code=response.status_code, body=data)

        return self._parse_result(data)

    def predict_batch(
        self,
        scenarios: List[Dict[str, Any]],
    ) -> List[Dict[str, Any]]:
        """Predict multiple scenarios in sequence.

        Stops early if rate-limited.

        Args:
            scenarios: List of dicts with keys: scenario (required), country, budget, timeline.

        Returns:
            List of dicts with keys: params, result (PredictionResult or None), error (Exception or None).
        """
        results: List[Dict[str, Any]] = []

        for params in scenarios:
            try:
                result = self.predict(
                    scenario=params["scenario"],
                    country=params.get("country"),
                    budget=params.get("budget"),
                    timeline=params.get("timeline"),
                )
                results.append({"params": params, "result": result, "error": None})
            except RateLimitError as e:
                results.append({"params": params, "result": None, "error": e})
                break  # Stop on rate limit
            except Exception as e:
                results.append({"params": params, "result": None, "error": e})

        return results

    @staticmethod
    def _parse_result(data: Dict[str, Any]) -> PredictionResult:
        """Parse API response into PredictionResult."""
        prob_range = data.get("probRange", {})
        bottlenecks = [
            Bottleneck(
                label=b.get("label", ""),
                prob=b.get("prob", 0),
                description=b.get("description", ""),
            )
            for b in data.get("keyBottlenecks", [])
        ]

        return PredictionResult(
            scenario=data.get("scenario", ""),
            probability=data.get("probability", 0),
            confidence=data.get("confidence", 0),
            prob_range={
                "optimistic": prob_range.get("optimistic", 0),
                "adverse": prob_range.get("adverse", 0),
            },
            key_bottlenecks=bottlenecks,
            sources=data.get("sources", []),
            sacred_roots=data.get("sacredRoots", []),
            generated_at=data.get("generatedAt", ""),
            meta=data.get("_meta"),
        )

    def close(self):
        """Close the underlying HTTP session."""
        self._session.close()

    def __enter__(self):
        return self

    def __exit__(self, *args):
        self.close()
