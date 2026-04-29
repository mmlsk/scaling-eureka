# Comprehensive Error Handling System Guide

This guide explains how to use the comprehensive error handling system in Scaling Eureka, including custom error classes, retry logic, error recovery, error boundaries, and React hooks.

## Overview

The error handling system provides multiple layers of protection:

1. **Custom Error Classes** - Specific error types for different scenarios
2. **Retry Logic** - Exponential backoff for transient failures
3. **Error Recovery** - Automatic recovery strategies
4. **Error Boundaries** - React component error isolation
5. **Error Hooks** - React hooks for error state management

## Quick Start

### 1. Import Error Handling Utilities

```typescript
import {
  // Custom errors
  APIError,
  ValidationError,
  DatabaseError,

  // Error utilities
  toAppError,
  getErrorMessage,
  getErrorCode,

  // Retry logic
  retryWithBackoff,
  retryAPICall,

  // Error recovery
  executeWithGlobalRecovery,

  // Error hooks
  useErrorHandler,
  useAPICall,
  useRetry,
} from '@/lib/errors';
```

### 2. Use Custom Error Classes

```typescript
import { APIError, ValidationError, DatabaseError } from '@/lib/errors';

// API error
throw new APIError(
  'Failed to fetch data',
  '/api/todos',
  'GET',
  500,
  { originalError: error }
);

// Validation error
throw new ValidationError(
  'Invalid email format',
  'email',
  userInput
);

// Database error
throw new DatabaseError(
  'Failed to insert record',
  'insert',
  'todos',
  { originalError: error }
);
```

### 3. Use Retry Logic

```typescript
import { retryWithBackoff, retryAPICall } from '@/lib/errors';

// Basic retry with exponential backoff
const result = await retryWithBackoff(async () => {
  return await fetch('/api/data');
}, {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
});

// API-specific retry
const data = await retryAPICall(async () => {
  return await fetchData();
});
```

### 4. Use Error Recovery

```typescript
import { executeWithGlobalRecovery } from '@/lib/errors';

// Execute with automatic recovery
const result = await executeWithGlobalRecovery(
  'fetchTodos',
  async () => {
    return await fetchTodos();
  },
  {
    strategy: 'retry',
    maxAttempts: 3,
  }
);
```

### 5. Use Error Hooks

```typescript
import { useErrorHandler, useAPICall } from '@/lib/errors';

function MyComponent() {
  const { handleError, isOnline, showSuccess } = useErrorHandler();

  const { data, error, isLoading } = useAPICall(
    async () => {
      return await fetchTodos();
    },
    {
      onSuccess: (data) => {
        showSuccess('Todos loaded successfully');
      },
      onError: (error) => {
        handleError(error, { component: 'MyComponent' });
      },
    }
  );

  // ... component logic
}
```

## Custom Error Classes

### Available Error Types

```typescript
// Base error class
class AppError extends Error {
  constructor(
    message: string,
    code: string,
    statusCode: number = 500,
    details?: Record<string, unknown>
  )
}

// API errors
class APIError extends AppError {
  constructor(
    message: string,
    endpoint: string,
    method: string = 'GET',
    statusCode: number = 500,
    details?: Record<string, unknown>
  )
}

// Network errors
class NetworkError extends AppError {
  constructor(
    message: string,
    url: string,
    details?: Record<string, unknown>
  )
}

// Timeout errors
class TimeoutError extends AppError {
  constructor(
    message: string,
    operation: string,
    timeout: number,
    details?: Record<string, unknown>
  )
}

// Validation errors
class ValidationError extends AppError {
  constructor(
    message: string,
    field: string,
    value: unknown,
    details?: Record<string, unknown>
  )
}

// Authentication errors
class AuthenticationError extends AppError {
  constructor(
    message: string,
    details?: Record<string, unknown>
  )
}

// Authorization errors
class AuthorizationError extends AppError {
  constructor(
    message: string,
    resource: string,
    action: string,
    details?: Record<string, unknown>
  )
}

// Not found errors
class NotFoundError extends AppError {
  constructor(
    message: string,
    resource: string,
    identifier: string,
    details?: Record<string, unknown>
  )
}

// Database errors
class DatabaseError extends AppError {
  constructor(
    message: string,
    operation: string,
    table: string,
    details?: Record<string, unknown>
  )
}

// Sync errors
class SyncError extends AppError {
  constructor(
    message: string,
    table: string,
    operation: 'insert' | 'update' | 'delete',
    recordId: string,
    details?: Record<string, unknown>
  )
}

// Cache errors
class CacheError extends AppError {
  constructor(
    message: string,
    cacheType: string,
    key: string,
    details?: Record<string, unknown>
  )
}

// State management errors
class StateError extends AppError {
  constructor(
    message: string,
    store: string,
    action: string,
    details?: Record<string, unknown>
  )
}

// Configuration errors
class ConfigurationError extends AppError {
  constructor(
    message: string,
    configKey: string,
    details?: Record<string, unknown>
  )
}

// Rate limit errors
class RateLimitError extends AppError {
  constructor(
    message: string,
    endpoint: string,
    retryAfter: number,
    details?: Record<string, unknown>
  )
}

// Service unavailable errors
class ServiceUnavailableError extends AppError {
  constructor(
    message: string,
    service: string,
    details?: Record<string, unknown>
  )
}

// Parse errors
class ParseError extends AppError {
  constructor(
    message: string,
    contentType: string,
    content: string,
    details?: Record<string, unknown>
  )
}

// Concurrency errors
class ConcurrencyError extends AppError {
  constructor(
    message: string,
    resource: string,
    currentVersion: string,
    attemptedVersion: string,
    details?: Record<string, unknown>
  )
}

// Business logic errors
class BusinessLogicError extends AppError {
  constructor(
    message: string,
    rule: string,
    details?: Record<string, unknown>
  )
}
```

### Error Utilities

```typescript
import {
  isAppError,
  getErrorCode,
  getErrorMessage,
  getErrorStatusCode,
  toAppError,
  createErrorFromResponse,
} from '@/lib/errors';

// Check if error is an AppError
if (isAppError(error)) {
  console.log(error.code, error.statusCode);
}

// Get error code
const code = getErrorCode(error); // 'API_ERROR', 'VALIDATION_ERROR', etc.

// Get error message
const message = getErrorMessage(error);

// Get error status code
const statusCode = getErrorStatusCode(error);

// Convert unknown error to AppError
const appError = toAppError(error);

// Create error from HTTP response
const appError = createErrorFromResponse(response, responseBody);
```

## Retry Logic

### Basic Retry

```typescript
import { retryWithBackoff } from '@/lib/errors';

const result = await retryWithBackoff(
  async () => {
    return await fetchData();
  },
  {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 30000,
    exponentialBase: 2,
    jitter: true,
    onRetry: (attempt, error) => {
      console.log(`Retry attempt ${attempt}:`, error.message);
    },
  }
);
```

### Specialized Retry Functions

```typescript
import {
  retryAPICall,
  retryDatabaseOperation,
  retrySyncOperation,
  retryWithTimeout,
  retryWithFallback,
} from '@/lib/errors';

// API call retry
const data = await retryAPICall(async () => {
  return await fetch('/api/data');
});

// Database operation retry
const result = await retryDatabaseOperation(async () => {
  return await db.todos.insert(todo);
});

// Sync operation retry
const synced = await retrySyncOperation(async () => {
  return await syncData();
});

// Retry with timeout
const result = await retryWithTimeout(
  async () => {
    return await fetchData();
  },
  5000 // 5 second timeout
);

// Retry with fallback
const result = await retryWithFallback(
  async () => {
    return await fetchFromAPI();
  },
  () => {
    return getCachedData(); // Fallback function
  }
);
```

### Circuit Breaker Pattern

```typescript
import { CircuitBreaker, retryWithCircuitBreaker } from '@/lib/errors';

const circuitBreaker = new CircuitBreaker(
  5, // threshold
  60000, // timeout (1 minute)
  3 // half-open max calls
);

try {
  const result = await circuitBreaker.execute(async () => {
    return await fetchData();
  });
} catch (error) {
  console.error('Circuit breaker is open:', error);
}

// Check circuit breaker state
console.log(circuitBreaker.getState()); // 'closed' | 'open' | 'half-open'
console.log(circuitBreaker.getFailures()); // number of failures

// Reset circuit breaker
circuitBreaker.reset();
```

### Bulk Retry

```typescript
import { bulkRetry } from '@/lib/errors';

const operations = [
  () => fetchTodo(1),
  () => fetchTodo(2),
  () => fetchTodo(3),
];

const results = await bulkRetry(operations);

results.forEach((result, index) => {
  if (result.success) {
    console.log(`Operation ${index} succeeded:`, result.result);
  } else {
    console.error(`Operation ${index} failed:`, result.error);
  }
});
```

## Error Recovery

### Recovery Strategies

```typescript
import {
  executeRecovery,
  getRecoveryConfig,
  executeWithGlobalRecovery,
} from '@/lib/errors';

// Execute with automatic recovery
const result = await executeRecovery(
  error,
  async () => {
    return await fetchData();
  },
  {
    strategy: 'retry',
    maxAttempts: 3,
    timeout: 10000,
  }
);

// Get recovery configuration for error type
const config = getRecoveryConfig(error);
console.log(config.strategy); // 'retry', 'fallback', 'notify', etc.

// Execute with global recovery manager
const result = await executeWithGlobalRecovery(
  'fetchTodos',
  async () => {
    return await fetchTodos();
  }
);
```

### Recovery Manager

```typescript
import { globalRecoveryManager } from '@/lib/errors';

// Execute with recovery
const result = await globalRecoveryManager.executeWithRecovery(
  'fetchTodos',
  async () => {
    return await fetchTodos();
  }
);

// Get recovery history
const history = globalRecoveryManager.getRecoveryHistory('fetchTodos');

// Get recovery statistics
const stats = globalRecoveryManager.getRecoveryStats('fetchTodos');
console.log(stats); // { success: 5, failure: 1 }

// Get success rate
const successRate = globalRecoveryManager.getRecoverySuccessRate('fetchTodos');
console.log(successRate); // 0.833 (83.3%)

// Clear recovery history
globalRecoveryManager.clearRecoveryHistory('fetchTodos');
```

### Advanced Recovery Patterns

```typescript
import {
  batchRecovery,
  recoveryWithHealthCheck,
  recoveryWithCacheFallback,
  recoveryWithDegradation,
} from '@/lib/errors';

// Batch recovery
const operations = [
  { id: 'todo1', operation: () => fetchTodo(1) },
  { id: 'todo2', operation: () => fetchTodo(2) },
];

const results = await batchRecovery(operations);

// Recovery with health check
const result = await recoveryWithHealthCheck(
  async () => {
    return await fetchData();
  },
  async () => {
    return await checkHealth(); // Returns boolean
  }
);

// Recovery with cache fallback
const result = await recoveryWithCacheFallback(
  async () => {
    return await fetchFromAPI();
  },
  () => {
    return getFromCache(); // Get cached data
  },
  (data) => {
    return saveToCache(data); // Save to cache
  }
);

// Recovery with graceful degradation
const result = await recoveryWithDegradation(
  async () => {
    return await fetchFullData(); // Primary operation
  },
  async () => {
    return await fetchBasicData(); // Fallback operation
  }
);
```

## Error Boundaries

### Basic Error Boundary

```typescript
import { ErrorBoundary } from '@/lib/errors';

function App() {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('Error caught:', error);
        console.error('Error info:', errorInfo);
      }}
    >
      <MyComponent />
    </ErrorBoundary>
  );
}
```

### Error Boundary with Custom Fallback

```typescript
import { ErrorBoundary } from '@/lib/errors';

function ErrorFallback({ error, resetError }: { error: Error; resetError: () => void }) {
  return (
    <div className="error-fallback">
      <h2>Something went wrong</h2>
      <p>{error.message}</p>
      <button onClick={resetError}>Try again</button>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <MyComponent />
    </ErrorBoundary>
  );
}
```

### Specialized Error Boundaries

```typescript
import {
  APIErrorBoundary,
  SyncErrorBoundary,
  ValidationErrorBoundary,
} from '@/lib/errors';

// API error boundary
<APIErrorBoundary
  onError={(error) => {
    console.error('API error:', error);
  }}
>
  <APIDataComponent />
</APIErrorBoundary>

// Sync error boundary
<SyncErrorBoundary
  onError={(error) => {
    console.error('Sync error:', error);
  }}
>
  <SyncComponent />
</SyncErrorBoundary>

// Validation error boundary
<ValidationErrorBoundary
  onError={(error) => {
    console.error('Validation error:', error);
  }}
>
  <FormComponent />
</ValidationErrorBoundary>
```

### Higher-Order Component

```typescript
import { withErrorBoundary } from '@/lib/errors';

const MyComponentWithErrorBoundary = withErrorBoundary(MyComponent, {
  onError: (error, errorInfo) => {
    console.error('Error:', error);
  },
  fallback: <div>Something went wrong</div>,
});

// Usage
<MyComponentWithErrorBoundary />
```

## Error Hooks

### useErrorHandler

```typescript
import { useErrorHandler } from '@/lib/errors';

function MyComponent() {
  const {
    error,
    isError,
    handleError,
    handleAsyncError,
    clearError,
    isOnline,
    logError,
    showSuccess,
  } = useErrorHandler();

  const handleClick = async () => {
    try {
      await handleAsyncError(async () => {
        await someAsyncOperation();
      }, { operation: 'handleClick' });
    } catch (error) {
      // Error is already handled
    }
  };

  if (isError) {
    return <div>Error: {error?.message}</div>;
  }

  return <button onClick={handleClick}>Click me</button>;
}
```

### useAPICall

```typescript
import { useAPICall } from '@/lib/errors';

function DataComponent() {
  const { data, error, isLoading, execute, refetch } = useAPICall(
    async () => {
      return await fetch('/api/data');
    },
    {
      enabled: true,
      refetchInterval: 60000, // Refetch every minute
      onSuccess: (data) => {
        console.log('Data loaded:', data);
      },
      onError: (error) => {
        console.error('Failed to load data:', error);
      },
    }
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>Data: {JSON.stringify(data)}</div>;
}
```

### useRetry

```typescript
import { useRetry } from '@/lib/errors';

function RetryComponent() {
  const { data, error, isLoading, retryCount, execute, retry } = useRetry(
    async () => {
      return await fetchData();
    },
    {
      maxRetries: 3,
      delay: 1000,
      onRetry: (attempt, error) => {
        console.log(`Retry ${attempt}:`, error.message);
      },
      onSuccess: (result) => {
        console.log('Success:', result);
      },
      onError: (error) => {
        console.error('Failed:', error);
      },
    }
  );

  return (
    <div>
      {isLoading && <div>Loading...</div>}
      {error && (
        <div>
          <p>Error: {error.message}</p>
          <p>Retry count: {retryCount}</p>
          <button onClick={retry}>Retry</button>
        </div>
      )}
      {data && <div>Data: {JSON.stringify(data)}</div>}
    </div>
  );
}
```

### useErrorRecovery

```typescript
import { useErrorRecovery } from '@/lib/errors';

function RecoveryComponent() {
  const {
    isRecovering,
    recoveryStats,
    executeWithRecovery,
    getHistory,
    getSuccessRate,
    clearHistory,
  } = useErrorRecovery('fetchTodos');

  const fetchData = async () => {
    return await executeWithRecovery(async () => {
      return await fetchTodos();
    });
  };

  return (
    <div>
      {isRecovering && <div>Recovering...</div>}
      <div>Success rate: {(getSuccessRate() * 100).toFixed(1)}%</div>
      <div>Success: {recoveryStats.success}, Failures: {recoveryStats.failure}</div>
      <button onClick={fetchData}>Fetch Data</button>
      <button onClick={clearHistory}>Clear History</button>
    </div>
  );
}
```

### useOnlineStatus

```typescript
import { useOnlineStatus } from '@/lib/errors';

function OnlineStatusComponent() {
  const { isOnline, isOffline } = useOnlineStatus();

  return (
    <div>
      {isOnline ? (
        <div className="online">🟢 Online</div>
      ) : (
        <div className="offline">🔴 Offline</div>
      )}
    </div>
  );
}
```

### useErrorLogger

```typescript
import { useErrorLogger } from '@/lib/errors';

function LoggingComponent() {
  const { logError, logInfo, logWarning } = useErrorLogger();

  const handleError = (error: Error) => {
    logError(error, { component: 'LoggingComponent' });
  };

  const handleInfo = (message: string) => {
    logInfo(message, { component: 'LoggingComponent' });
  };

  const handleWarning = (message: string) => {
    logWarning(message, { component: 'LoggingComponent' });
  };

  return <div> {/* Component content */} </div>;
}
```

### useErrorMetrics

```typescript
import { useErrorMetrics } from '@/lib/errors';

function MetricsComponent() {
  const { metrics, recordError, clearMetrics, getErrorRate } = useErrorMetrics();

  const handleOperation = async () => {
    try {
      await someOperation();
    } catch (error) {
      recordError(error as Error);
    }
  };

  return (
    <div>
      <div>Total errors: {metrics.totalErrors}</div>
      <div>Error rate (last minute): {getErrorRate(60000)}</div>
      <div>Errors by type: {JSON.stringify(metrics.errorsByType)}</div>
      <button onClick={clearMetrics}>Clear Metrics</button>
    </div>
  );
}
```

## Integration Examples

### React Query Integration

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import { useErrorHandler, APIError, DatabaseError } from '@/lib/errors';

function useTodos() {
  const { handleError, isOnline } = useErrorHandler();

  return useQuery({
    queryKey: ['todos'],
    queryFn: async () => {
      if (!isOnline) {
        throw new APIError('Cannot fetch todos while offline', '/todos', 'GET', 0);
      }

      try {
        const response = await fetch('/api/todos');
        if (!response.ok) {
          throw new APIError(
            `Failed to fetch todos: ${response.statusText}`,
            '/todos',
            'GET',
            response.status
          );
        }
        return response.json();
      } catch (error) {
        throw handleError(error, { operation: 'fetchTodos' });
      }
    },
    retry: (failureCount, error) => {
      // Don't retry on validation errors
      if (error instanceof ValidationError) {
        return false;
      }
      return failureCount < 3;
    },
  });
}
```

### Form Validation Integration

```typescript
import { useState } from 'react';
import { useErrorHandler, ValidationError } from '@/lib/errors';

function TodoForm() {
  const { handleError, showSuccess } = useErrorHandler();
  const [text, setText] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Validate input
      if (!text.trim()) {
        throw new ValidationError('Todo text cannot be empty', 'text', text);
      }

      if (text.length > 500) {
        throw new ValidationError('Todo text too long', 'text', text);
      }

      await createTodo({ text });
      showSuccess('Todo created successfully');
      setText('');
    } catch (error) {
      handleError(error, { operation: 'createTodo', text });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter todo..."
      />
      <button type="submit">Add Todo</button>
    </form>
  );
}
```

### API Route Integration

```typescript
import { NextRequest, NextResponse } from 'next/server';
import {
  APIError,
  ValidationError,
  toAppError,
  createErrorFromResponse,
} from '@/lib/errors';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    if (!body.text || typeof body.text !== 'string') {
      throw new ValidationError('Invalid todo text', 'text', body.text);
    }

    // Create todo
    const todo = await createTodo(body);

    return NextResponse.json(todo);
  } catch (error) {
    const appError = toAppError(error);

    // Log error
    console.error('API error:', appError.toJSON());

    // Return error response
    return NextResponse.json(
      {
        error: appError.message,
        code: appError.code,
        details: appError.details,
      },
      { status: appError.statusCode }
    );
  }
}
```

## Best Practices

### 1. Always Use Specific Error Types

```typescript
// ✅ Good
throw new APIError('Failed to fetch data', '/api/todos', 'GET', 500);

// ❌ Bad
throw new Error('Failed to fetch data');
```

### 2. Provide Context in Errors

```typescript
// ✅ Good
throw new DatabaseError(
  'Failed to insert todo',
  'insert',
  'todos',
  { originalError: error, todo: { text, priority } }
);

// ❌ Bad
throw new DatabaseError('Failed to insert todo', 'insert', 'todos');
```

### 3. Use Retry for Transient Failures

```typescript
// ✅ Good
const data = await retryAPICall(async () => {
  return await fetch('/api/data');
});

// ❌ Bad
const data = await fetch('/api/data'); // No retry on failure
```

### 4. Implement Error Recovery

```typescript
// ✅ Good
const result = await executeWithGlobalRecovery(
  'fetchTodos',
  async () => {
    return await fetchTodos();
  }
);

// ❌ Bad
const result = await fetchTodos(); // No recovery strategy
```

### 5. Use Error Boundaries

```typescript
// ✅ Good
<ErrorBoundary>
  <MyComponent />
</ErrorBoundary>

// ❌ Bad
<MyComponent /> // No error boundary
```

### 6. Log Errors Properly

```typescript
// ✅ Good
const { logError } = useErrorLogger();
logError(error, { component: 'MyComponent', operation: 'fetchData' });

// ❌ Bad
console.error(error); // No context
```

### 7. Provide User Feedback

```typescript
// ✅ Good
const { showSuccess, showToast } = useErrorHandler();
showSuccess('Operation completed successfully');
showToast(error);

// ❌ Bad
// No user feedback
```

## Troubleshooting

### Common Issues

#### Issue: Errors not being caught by error boundary

```typescript
// Problem: Async errors not caught
useEffect(() => {
  fetchData(); // Async error not caught
}, []);

// Solution: Use error handling in async functions
useEffect(() => {
  const fetchDataWithErrorHandling = async () => {
    try {
      await fetchData();
    } catch (error) {
      handleError(error);
    }
  };

  fetchDataWithErrorHandling();
}, []);
```

#### Issue: Retry not working

```typescript
// Problem: Retry configuration incorrect
const result = await retryWithBackoff(fn, {
  maxRetries: 0, // No retries!
});

// Solution: Configure retry properly
const result = await retryWithBackoff(fn, {
  maxRetries: 3,
  baseDelay: 1000,
});
```

#### Issue: Recovery not triggering

```typescript
// Problem: Error type not recognized
const error = new Error('Custom error');
const config = getRecoveryConfig(error); // Returns default config

// Solution: Use custom error types
const error = new APIError('Custom error', '/api/endpoint', 'GET', 500);
const config = getRecoveryConfig(error); // Returns API-specific config
```

## Performance Considerations

### Error Handling Overhead

```typescript
// Minimal overhead for error handling
const result = await executeWithGlobalRecovery('operation', fn);
// < 1ms overhead for most operations

// Retry overhead scales with attempts
const result = await retryWithBackoff(fn, {
  maxRetries: 3,
  baseDelay: 1000,
});
// Up to 7 seconds total for failed operations
```

### Optimization Strategies

```typescript
// Use selective error handling
function externalHandler(data: unknown) {
  const validated = validateTodoData(data); // Validate external data
  internalFunction(validated); // No validation for internal data
}

// Cache recovery configurations
const recoveryConfig = getRecoveryConfig(error);
// Configurations are cached for performance

// Batch operations
const results = await bulkRetry(operations);
// Parallel execution for better performance
```

## Testing

### Unit Tests

```typescript
import { describe, it, expect } from 'vitest';
import { APIError, toAppError, getErrorCode } from '@/lib/errors';

describe('Error Handling', () => {
  it('should create API error', () => {
    const error = new APIError('Test error', '/api/test', 'GET', 500);
    expect(error.code).toBe('API_ERROR');
    expect(error.statusCode).toBe(500);
  });

  it('should convert unknown error to AppError', () => {
    const error = toAppError('Unknown error');
    expect(error).toBeInstanceOf(AppError);
  });

  it('should get error code', () => {
    const error = new APIError('Test error', '/api/test', 'GET', 500);
    expect(getErrorCode(error)).toBe('API_ERROR');
  });
});
```

### Integration Tests

```typescript
describe('Error Recovery Integration', () => {
  it('should recover from API error', async () => {
    let attempts = 0;
    const fn = async () => {
      attempts++;
      if (attempts < 3) {
        throw new APIError('Test error', '/api/test', 'GET', 500);
      }
      return { success: true };
    };

    const result = await executeWithGlobalRecovery('test', fn);
    expect(result).toEqual({ success: true });
    expect(attempts).toBe(3);
  });
});
```

## Additional Resources

- [Error Handling Best Practices](https://cheatsheetseries.owasp.org/cheatsheets/Error_Handling_Cheat_Sheet.html)
- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [Retry Patterns](https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/)

## Support

For questions or issues with the error handling system:

1. Check this guide for common patterns
2. Review the error handling source code in `lib/errors/`
3. Consult the TypeScript documentation for error handling
4. Open an issue for bugs or feature requests