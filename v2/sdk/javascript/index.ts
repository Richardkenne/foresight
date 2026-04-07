/**
 * Simulator Prediction API -- JavaScript/TypeScript SDK
 * Deterministic scenario analysis powered by 350K+ data points.
 */

// ============ TYPES ============

export interface PredictionParams {
  /** The scenario to predict. Max 2000 characters. */
  scenario: string;
  /** Target country for location-specific data. */
  country?: string;
  /** Available budget in USD. */
  budget?: number;
  /** Target timeline (e.g. "6 months", "2 years"). */
  timeline?: string;
}

export interface Bottleneck {
  /** Short name of the bottleneck gate. */
  label: string;
  /** Pass probability (0-100). */
  prob: number;
  /** Description with data source citation. */
  description: string;
}

export interface PredictionResult {
  /** The input scenario (echoed back). */
  scenario: string;
  /** Overall success probability (0-100). */
  probability: number;
  /** Data confidence score (0.0-1.0). */
  confidence: number;
  /** Optimistic and adverse probability bounds. */
  probRange: { optimistic: number; adverse: number };
  /** Top 3-5 critical gates with pass probabilities. */
  keyBottlenecks: Bottleneck[];
  /** Data sources referenced in the prediction. */
  sources: string[];
  /** Relevant sacred behavioral roots. */
  sacredRoots: string[];
  /** ISO 8601 timestamp of generation. */
  generatedAt: string;
  /** Internal metadata. */
  _meta?: {
    provider?: string;
    dataSource?: string;
    responseTime?: string;
  };
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetAt: Date;
}

// ============ ERRORS ============

export class SimulatorError extends Error {
  public readonly statusCode: number;
  public readonly body: unknown;

  constructor(message: string, statusCode: number, body?: unknown) {
    super(message);
    this.name = 'SimulatorError';
    this.statusCode = statusCode;
    this.body = body;
  }
}

export class ValidationError extends SimulatorError {
  constructor(message: string, body?: unknown) {
    super(message, 400, body);
    this.name = 'ValidationError';
  }
}

export class RateLimitError extends SimulatorError {
  public readonly resetAt: Date;
  public readonly retryAfter: number;

  constructor(message: string, resetAt: Date, retryAfter: number, body?: unknown) {
    super(message, 429, body);
    this.name = 'RateLimitError';
    this.resetAt = resetAt;
    this.retryAfter = retryAfter;
  }
}

export class ServerError extends SimulatorError {
  constructor(message: string, body?: unknown) {
    super(message, 500, body);
    this.name = 'ServerError';
  }
}

// ============ CLIENT ============

export interface SimulatorClientOptions {
  /** Base URL of the Simulator API. Defaults to https://simulator.vercel.app */
  baseUrl?: string;
  /** API key for authenticated requests (future feature). */
  apiKey?: string;
  /** Request timeout in milliseconds. Defaults to 30000. */
  timeout?: number;
}

export class SimulatorClient {
  private readonly baseUrl: string;
  private readonly apiKey?: string;
  private readonly timeout: number;

  constructor(options: SimulatorClientOptions = {}) {
    this.baseUrl = (options.baseUrl || 'https://simulator.vercel.app').replace(/\/$/, '');
    this.apiKey = options.apiKey;
    this.timeout = options.timeout ?? 30000;
  }

  /**
   * Predict the probability of success for a scenario.
   *
   * @param params - Prediction parameters (scenario is required).
   * @returns The prediction result with probabilities, bottlenecks, and sources.
   * @throws {ValidationError} If input is invalid (400).
   * @throws {RateLimitError} If rate limit exceeded (429).
   * @throws {ServerError} If server error (500).
   * @throws {SimulatorError} For other HTTP errors.
   */
  async predict(params: PredictionParams): Promise<PredictionResult> {
    // Client-side validation
    if (!params.scenario || params.scenario.trim().length === 0) {
      throw new ValidationError('Scenario is required and must be a non-empty string.');
    }
    if (params.scenario.length > 2000) {
      throw new ValidationError('Scenario must be 2000 characters or fewer.');
    }

    const body: Record<string, unknown> = { scenario: params.scenario.trim() };
    if (params.country) body.country = params.country;
    if (params.budget !== undefined) body.budget = params.budget;
    if (params.timeline) body.timeline = params.timeline;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}/api/predict`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: controller.signal,
      });
    } catch (err) {
      clearTimeout(timeoutId);
      if ((err as Error).name === 'AbortError') {
        throw new SimulatorError(`Request timed out after ${this.timeout}ms`, 0);
      }
      throw new SimulatorError(
        `Network error: ${(err as Error).message}`,
        0,
        err,
      );
    } finally {
      clearTimeout(timeoutId);
    }

    const data = await response.json();

    if (!response.ok) {
      const message = (data as { error?: string }).error || `HTTP ${response.status}`;

      if (response.status === 400) {
        throw new ValidationError(message, data);
      }

      if (response.status === 429) {
        const resetHeader = response.headers.get('X-RateLimit-Reset');
        const retryHeader = response.headers.get('Retry-After');
        const resetAt = resetHeader ? new Date(Number(resetHeader) * 1000) : new Date();
        const retryAfter = retryHeader ? Number(retryHeader) : 0;
        throw new RateLimitError(message, resetAt, retryAfter, data);
      }

      if (response.status >= 500) {
        throw new ServerError(message, data);
      }

      throw new SimulatorError(message, response.status, data);
    }

    return data as PredictionResult;
  }

  /**
   * Predict multiple scenarios in sequence.
   * Respects rate limits by stopping if a 429 is received.
   *
   * @param paramsList - Array of prediction parameters.
   * @returns Array of results (PredictionResult on success, Error on failure).
   */
  async predictBatch(
    paramsList: PredictionParams[],
  ): Promise<Array<{ params: PredictionParams; result?: PredictionResult; error?: Error }>> {
    const results: Array<{ params: PredictionParams; result?: PredictionResult; error?: Error }> = [];

    for (const params of paramsList) {
      try {
        const result = await this.predict(params);
        results.push({ params, result });
      } catch (err) {
        results.push({ params, error: err as Error });
        // Stop on rate limit -- no point continuing
        if (err instanceof RateLimitError) break;
      }
    }

    return results;
  }

  /**
   * Get rate limit info from the last response headers.
   * Note: This requires making a request first. For a lightweight check,
   * use a minimal scenario.
   */
  getRateLimitUrl(): string {
    return `${this.baseUrl}/api/predict`;
  }
}

// Default export for convenience
export default SimulatorClient;
