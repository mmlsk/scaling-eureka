// Custom error classes for comprehensive error handling

/**
 * Base application error class
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      details: this.details,
      stack: this.stack,
    };
  }
}

/**
 * API-related errors
 */
export class APIError extends AppError {
  constructor(
    message: string,
    public endpoint: string,
    public method: string = 'GET',
    statusCode: number = 500,
    details?: Record<string, unknown>
  ) {
    super(message, 'API_ERROR', statusCode, {
      endpoint,
      method,
      ...details,
    });
  }
}

/**
 * Network-related errors
 */
export class NetworkError extends AppError {
  constructor(
    message: string,
    public url: string,
    details?: Record<string, unknown>
  ) {
    super(message, 'NETWORK_ERROR', 0, { url, ...details });
  }
}

/**
 * Timeout errors
 */
export class TimeoutError extends AppError {
  constructor(
    message: string,
    public operation: string,
    public timeout: number,
    details?: Record<string, unknown>
  ) {
    super(message, 'TIMEOUT_ERROR', 408, {
      operation,
      timeout,
      ...details,
    });
  }
}

/**
 * Validation errors
 */
export class ValidationError extends AppError {
  constructor(
    message: string,
    public field: string,
    public value: unknown,
    details?: Record<string, unknown>
  ) {
    super(message, 'VALIDATION_ERROR', 400, {
      field,
      value: String(value),
      ...details,
    });
  }
}

/**
 * Authentication errors
 */
export class AuthenticationError extends AppError {
  constructor(
    message: string,
    details?: Record<string, unknown>
  ) {
    super(message, 'AUTH_ERROR', 401, details);
  }
}

/**
 * Authorization errors
 */
export class AuthorizationError extends AppError {
  constructor(
    message: string,
    public resource: string,
    public action: string,
    details?: Record<string, unknown>
  ) {
    super(message, 'AUTHORIZATION_ERROR', 403, {
      resource,
      action,
      ...details,
    });
  }
}

/**
 * Not found errors
 */
export class NotFoundError extends AppError {
  constructor(
    message: string,
    public resource: string,
    public identifier: string,
    details?: Record<string, unknown>
  ) {
    super(message, 'NOT_FOUND_ERROR', 404, {
      resource,
      identifier,
      ...details,
    });
  }
}

/**
 * Database errors
 */
export class DatabaseError extends AppError {
  constructor(
    message: string,
    public operation: string,
    public table: string,
    details?: Record<string, unknown>
  ) {
    super(message, 'DATABASE_ERROR', 500, {
      operation,
      table,
      ...details,
    });
  }
}

/**
 * Sync-related errors
 */
export class SyncError extends AppError {
  constructor(
    message: string,
    public table: string,
    public operation: 'insert' | 'update' | 'delete',
    public recordId: string,
    details?: Record<string, unknown>
  ) {
    super(message, 'SYNC_ERROR', 500, {
      table,
      operation,
      recordId,
      ...details,
    });
  }
}

/**
 * Cache errors
 */
export class CacheError extends AppError {
  constructor(
    message: string,
    public cacheType: string,
    public key: string,
    details?: Record<string, unknown>
  ) {
    super(message, 'CACHE_ERROR', 500, {
      cacheType,
      key,
      ...details,
    });
  }
}

/**
 * State management errors
 */
export class StateError extends AppError {
  constructor(
    message: string,
    public store: string,
    public action: string,
    details?: Record<string, unknown>
  ) {
    super(message, 'STATE_ERROR', 500, {
      store,
      action,
      ...details,
    });
  }
}

/**
 * Configuration errors
 */
export class ConfigurationError extends AppError {
  constructor(
    message: string,
    public configKey: string,
    details?: Record<string, unknown>
  ) {
    super(message, 'CONFIGURATION_ERROR', 500, {
      configKey,
      ...details,
    });
  }
}

/**
 * Rate limit errors
 */
export class RateLimitError extends AppError {
  constructor(
    message: string,
    public endpoint: string,
    public retryAfter: number,
    details?: Record<string, unknown>
  ) {
    super(message, 'RATE_LIMIT_ERROR', 429, {
      endpoint,
      retryAfter,
      ...details,
    });
  }
}

/**
 * Service unavailable errors
 */
export class ServiceUnavailableError extends AppError {
  constructor(
    message: string,
    public service: string,
    details?: Record<string, unknown>
  ) {
    super(message, 'SERVICE_UNAVAILABLE_ERROR', 503, {
      service,
      ...details,
    });
  }
}

/**
 * Parse errors
 */
export class ParseError extends AppError {
  constructor(
    message: string,
    public contentType: string,
    public content: string,
    details?: Record<string, unknown>
  ) {
    super(message, 'PARSE_ERROR', 400, {
      contentType,
      content: content.substring(0, 100), // Truncate for security
      ...details,
    });
  }
}

/**
 * Concurrency errors
 */
export class ConcurrencyError extends AppError {
  constructor(
    message: string,
    public resource: string,
    public currentVersion: string,
    public attemptedVersion: string,
    details?: Record<string, unknown>
  ) {
    super(message, 'CONCURRENCY_ERROR', 409, {
      resource,
      currentVersion,
      attemptedVersion,
      ...details,
    });
  }
}

/**
 * Business logic errors
 */
export class BusinessLogicError extends AppError {
  constructor(
    message: string,
    public rule: string,
    details?: Record<string, unknown>
  ) {
    super(message, 'BUSINESS_LOGIC_ERROR', 422, {
      rule,
      ...details,
    });
  }
}

/**
 * Error type guard
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Get error code from unknown error
 */
export function getErrorCode(error: unknown): string {
  if (isAppError(error)) {
    return error.code;
  }
  if (error instanceof Error) {
    return error.name;
  }
  return 'UNKNOWN_ERROR';
}

/**
 * Get error message from unknown error
 */
export function getErrorMessage(error: unknown): string {
  if (isAppError(error)) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unknown error occurred';
}

/**
 * Get error status code from unknown error
 */
export function getErrorStatusCode(error: unknown): number {
  if (isAppError(error)) {
    return error.statusCode;
  }
  return 500;
}

/**
 * Convert unknown error to AppError
 */
export function toAppError(error: unknown, defaultMessage = 'An error occurred'): AppError {
  if (isAppError(error)) {
    return error;
  }
  if (error instanceof Error) {
    return new AppError(error.message, 'UNKNOWN_ERROR', 500, {
      originalError: error.name,
      stack: error.stack,
    });
  }
  if (typeof error === 'string') {
    return new AppError(error, 'UNKNOWN_ERROR', 500);
  }
  return new AppError(defaultMessage, 'UNKNOWN_ERROR', 500, {
    originalError: String(error),
  });
}

/**
 * Create error from HTTP response
 */
export function createErrorFromResponse(response: Response, body?: unknown): AppError {
  const status = response.status;
  const message = body && typeof body === 'object' && 'message' in body
    ? String(body.message)
    : response.statusText || 'Request failed';

  switch (status) {
    case 400:
      return new ValidationError(message, 'response', body);
    case 401:
      return new AuthenticationError(message, { response: body });
    case 403:
      return new AuthorizationError(message, 'resource', 'action', { response: body });
    case 404:
      return new NotFoundError(message, 'resource', 'identifier', { response: body });
    case 408:
      return new TimeoutError(message, 'request', 30000, { response: body });
    case 409:
      return new ConcurrencyError(message, 'resource', 'current', 'attempted', { response: body });
    case 422:
      return new BusinessLogicError(message, 'validation', { response: body });
    case 429:
      const retryAfter = response.headers.get('Retry-After');
      return new RateLimitError(
        message,
        'endpoint',
        retryAfter ? parseInt(retryAfter, 10) : 60,
        { response: body }
      );
    case 500:
      return new APIError(message, 'endpoint', 'GET', status, { response: body });
    case 503:
      return new ServiceUnavailableError(message, 'service', { response: body });
    default:
      return new APIError(message, 'endpoint', 'GET', status, { response: body });
  }
}