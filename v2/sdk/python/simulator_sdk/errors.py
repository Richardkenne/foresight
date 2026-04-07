"""Error classes for the Simulator SDK."""

from typing import Any, Optional
from datetime import datetime


class SimulatorError(Exception):
    """Base error for all Simulator API errors."""

    def __init__(
        self,
        message: str,
        status_code: int = 0,
        body: Optional[Any] = None,
    ):
        super().__init__(message)
        self.status_code = status_code
        self.body = body


class ValidationError(SimulatorError):
    """Raised when the API returns 400 (invalid input)."""

    def __init__(self, message: str, body: Optional[Any] = None):
        super().__init__(message, status_code=400, body=body)


class RateLimitError(SimulatorError):
    """Raised when the API returns 429 (rate limit exceeded)."""

    def __init__(
        self,
        message: str,
        reset_at: Optional[datetime] = None,
        retry_after: int = 0,
        body: Optional[Any] = None,
    ):
        super().__init__(message, status_code=429, body=body)
        self.reset_at = reset_at or datetime.utcnow()
        self.retry_after = retry_after


class ServerError(SimulatorError):
    """Raised when the API returns 500 (server error)."""

    def __init__(self, message: str, body: Optional[Any] = None):
        super().__init__(message, status_code=500, body=body)
