// Error handling system - main exports

// Custom error classes
export * from './custom-errors';

// Retry logic
export * from './retry-logic';

// Error recovery
export * from './error-recovery';

// Error boundaries
export * from './error-boundary';

// Error hooks - explicitly exported below

// Re-export commonly used items
export {
  // Custom errors
  AppError,
  APIError,
  NetworkError,
  TimeoutError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  DatabaseError,
  SyncError,
  CacheError,
  StateError,
  ConfigurationError,
  RateLimitError,
  ServiceUnavailableError,
  ParseError,
  ConcurrencyError,
  BusinessLogicError,
  // Error utilities
  isAppError,
  getErrorCode,
  getErrorMessage,
  getErrorStatusCode,
  toAppError,
  createErrorFromResponse,
} from './custom-errors';

export {
  // Retry functions
  retryWithBackoff,
  retryWithCondition,
  retryAPICall,
  retryDatabaseOperation,
  retrySyncOperation,
  makeRetryable,
  retryWithTimeout,
  retryWithCircuitBreaker,
  bulkRetry,
  retryWithFallback,
  retryWithFallbacks,
  // Circuit breaker
  CircuitBreaker,
  retryWithCircuitBreaker as retryWithCircuitBreakerFn,
} from './retry-logic';

export {
  // Recovery functions
  getRecoveryConfig,
  executeRecovery,
  globalRecoveryManager,
  executeWithGlobalRecovery,
  createRecoveryAwareFunction,
  batchRecovery,
  recoveryWithHealthCheck,
  recoveryWithCacheFallback,
  recoveryWithDegradation,
  // Recovery manager
  ErrorRecoveryManager,
} from './error-recovery';

export {
  // Error boundaries
  ErrorBoundary,
  withErrorBoundary,
  useErrorHandler as useErrorHandlerBoundary,
  AsyncErrorBoundary,
  APIErrorBoundary,
  SyncErrorBoundary,
  ValidationErrorBoundary,
} from './error-boundary';

export {
  // Error hooks
  useError,
  useAsyncError,
  useRetry,
  useAPICall,
  useDatabaseOperation,
  useSyncOperation,
  useErrorRecovery,
  useErrorBoundary,
  useOnlineStatus,
  useErrorLogger,
  useErrorToast,
  useErrorHandler as useComprehensiveErrorHandler,
  useErrorMetrics,
} from './error-hooks';