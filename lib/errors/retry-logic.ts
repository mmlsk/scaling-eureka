// Retry logic with exponential backoff

import { AppError, TimeoutError, NetworkError, RateLimitError } from './custom-errors';

/**
 * Retry configuration options
 */
export interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  exponentialBase?: number;
  jitter?: boolean;
  retryableErrors?: string[];
  onRetry?: (attempt: number, error: Error) => void;
  shouldRetry?: (error: Error, attempt: number) => boolean;
}

/**
 * Default retry options
 */
const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 30000,
  exponentialBase: 2,
  jitter: true,
  retryableErrors: [
    'NETWORK_ERROR',
    'TIMEOUT_ERROR',
    'RATE_LIMIT_ERROR',
    'SERVICE_UNAVAILABLE_ERROR',
  ],
  onRetry: () => {},
  shouldRetry: () => true,
};

/**
 * Calculate delay with exponential backoff and optional jitter
 */
function calculateDelay(
  attempt: number,
  options: Required<RetryOptions>
): number {
  const exponentialDelay = options.baseDelay * Math.pow(options.exponentialBase, attempt);
  const delay = Math.min(exponentialDelay, options.maxDelay);

  // Add jitter to prevent thundering herd
  if (options.jitter) {
    const jitterAmount = delay * 0.1; // 10% jitter
    const jitter = Math.random() * jitterAmount - jitterAmount / 2;
    return Math.max(0, delay + jitter);
  }

  return delay;
}

/**
 * Check if error is retryable
 */
function isRetryableError(error: Error, options: Required<RetryOptions>): boolean {
  // Check custom shouldRetry function first
  if (!options.shouldRetry(error, 0)) {
    return false;
  }

  // Check if error is an AppError with retryable code
  if (error instanceof AppError) {
    return options.retryableErrors.includes(error.code);
  }

  // Check for common retryable error types
  if (
    error instanceof NetworkError ||
    error instanceof TimeoutError ||
    error instanceof RateLimitError
  ) {
    return true;
  }

  // Check error message for common retryable patterns
  const retryablePatterns = [
    /network/i,
    /timeout/i,
    /rate limit/i,
    /service unavailable/i,
    /temporary/i,
    /try again/i,
    /ECONNRESET/i,
    /ETIMEDOUT/i,
    /ECONNREFUSED/i,
  ];

  return retryablePatterns.some(pattern => pattern.test(error.message));
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_RETRY_OPTIONS, ...options };

  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      lastError = err;

      // Don't retry on last attempt
      if (attempt === opts.maxRetries) {
        throw err;
      }

      // Check if error is retryable
      if (!isRetryableError(err, opts)) {
        throw err;
      }

      // Calculate delay and wait
      const delay = calculateDelay(attempt, opts);

      // Call onRetry callback
      opts.onRetry(attempt + 1, err);

      // Wait before retry
      await sleep(delay);
    }
  }

  // This should never be reached, but TypeScript needs it
  throw lastError || new Error('Max retries exceeded');
}

/**
 * Retry function with custom retry condition
 */
export async function retryWithCondition<T>(
  fn: () => Promise<T>,
  shouldRetry: (error: Error, attempt: number) => boolean,
  options: Omit<RetryOptions, 'shouldRetry'> = {}
): Promise<T> {
  return retryWithBackoff(fn, {
    ...options,
    shouldRetry,
  });
}

/**
 * Retry function for API calls
 */
export async function retryAPICall<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  return retryWithBackoff(fn, {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    ...options,
    retryableErrors: [
      'NETWORK_ERROR',
      'TIMEOUT_ERROR',
      'RATE_LIMIT_ERROR',
      'SERVICE_UNAVAILABLE_ERROR',
      'API_ERROR',
    ],
  });
}

/**
 * Retry function for database operations
 */
export async function retryDatabaseOperation<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  return retryWithBackoff(fn, {
    maxRetries: 2,
    baseDelay: 500,
    maxDelay: 2000,
    ...options,
    retryableErrors: [
      'DATABASE_ERROR',
      'NETWORK_ERROR',
      'TIMEOUT_ERROR',
    ],
  });
}

/**
 * Retry function for sync operations
 */
export async function retrySyncOperation<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  return retryWithBackoff(fn, {
    maxRetries: 5,
    baseDelay: 2000,
    maxDelay: 60000,
    ...options,
    retryableErrors: [
      'SYNC_ERROR',
      'NETWORK_ERROR',
      'TIMEOUT_ERROR',
      'RATE_LIMIT_ERROR',
    ],
  });
}

/**
 * Create a retryable version of any function
 */
export function makeRetryable<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  options: RetryOptions = {}
): T {
  return (async (...args: Parameters<T>) => {
    return retryWithBackoff(() => fn(...args), options);
  }) as T;
}

/**
 * Retry with timeout
 */
export async function retryWithTimeout<T>(
  fn: () => Promise<T>,
  timeout: number,
  options: RetryOptions = {}
): Promise<T> {
  return retryWithBackoff(async () => {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new TimeoutError('Operation timed out', 'retryWithTimeout', timeout)), timeout);
    });

    return Promise.race([fn(), timeoutPromise]);
  }, options);
}

/**
 * Retry with circuit breaker pattern
 */
export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';

  constructor(
    private threshold: number = 5,
    private timeout: number = 60000,
    private halfOpenMaxCalls: number = 3
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Check if circuit is open
    if (this.state === 'open') {
      const timeSinceLastFailure = Date.now() - this.lastFailureTime;
      if (timeSinceLastFailure < this.timeout) {
        throw new Error('Circuit breaker is OPEN');
      }
      // Transition to half-open
      this.state = 'half-open';
    }

    try {
      const result = await fn();

      // Success - reset or close circuit
      if (this.state === 'half-open') {
        this.failures = 0;
        this.state = 'closed';
      }

      return result;
    } catch (error) {
      this.failures++;
      this.lastFailureTime = Date.now();

      // Check if threshold reached
      if (this.failures >= this.threshold) {
        this.state = 'open';
      }

      throw error;
    }
  }

  getState(): 'closed' | 'open' | 'half-open' {
    return this.state;
  }

  getFailures(): number {
    return this.failures;
  }

  reset(): void {
    this.failures = 0;
    this.lastFailureTime = 0;
    this.state = 'closed';
  }
}

/**
 * Retry with circuit breaker
 */
export function retryWithCircuitBreaker<T>(
  fn: () => Promise<T>,
  circuitBreaker: CircuitBreaker
): Promise<T> {
  return circuitBreaker.execute(fn);
}

/**
 * Bulk retry - retry multiple operations in parallel
 */
export async function bulkRetry<T>(
  operations: Array<() => Promise<T>>,
  options: RetryOptions = {}
): Promise<Array<{ success: boolean; result?: T; error?: Error }>> {
  const results = await Promise.allSettled(
    operations.map(op => retryWithBackoff(op, options))
  );

  return results.map(result => {
    if (result.status === 'fulfilled') {
      return { success: true, result: result.value };
    } else {
      return { success: false, error: result.reason };
    }
  });
}

/**
 * Retry with fallback
 */
export async function retryWithFallback<T>(
  fn: () => Promise<T>,
  fallback: () => T | Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  try {
    return await retryWithBackoff(fn, options);
  } catch (error) {
    return await fallback();
  }
}

/**
 * Retry with multiple fallbacks
 */
export async function retryWithFallbacks<T>(
  fns: Array<() => Promise<T>>,
  options: RetryOptions = {}
): Promise<T> {
  for (let i = 0; i < fns.length; i++) {
    try {
      return await retryWithBackoff(fns[i], {
        ...options,
        maxRetries: i === fns.length - 1 ? 0 : options.maxRetries, // No retry on last fallback
      });
    } catch (error) {
      if (i === fns.length - 1) {
        throw error; // All fallbacks failed
      }
      // Continue to next fallback
    }
  }

  throw new Error('No fallbacks available');
}