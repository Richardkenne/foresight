"""
Simulator Prediction API -- Python SDK
Deterministic scenario analysis powered by 350K+ data points.
"""

from .client import SimulatorClient, PredictionResult, Bottleneck, RateLimitInfo
from .errors import SimulatorError, ValidationError, RateLimitError, ServerError

__version__ = "1.0.0"

__all__ = [
    "SimulatorClient",
    "PredictionResult",
    "Bottleneck",
    "RateLimitInfo",
    "SimulatorError",
    "ValidationError",
    "RateLimitError",
    "ServerError",
]
