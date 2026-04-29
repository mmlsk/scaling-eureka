'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  AppError,
  toAppError,
  getErrorCode,
  getErrorMessage,
  getErrorStatusCode,
} from './custom-errors';
import {
  retryWithBackoff,
  retryAPICall,
  retryDatabaseOperation,
  retrySyncOperation,
} from './retry-logic';
import {
  executeWithGlobalRecovery,
  globalRecoveryManager,
  getRecoveryConfig,
} from './error-recovery';

/**
 * Error state
 */
interface ErrorState {
  error: Error | null;
  isError: boolean;
}

/**
 * Use error hook
 */
export function useError() {
  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    isError: false,
  });

  const setError = useCallback((error: Error | unknown) => {
    const appError = toAppError(error);
    setErrorState({
      error: appError,
      isError: true,
    });
  }, []);

  const clearError = useCallback(() => {
    setErrorState({
      error: null,
      isError: false,
    });
  }, []);

  const resetError = useCallback(() => {
    clearError();
  }, [clearError]);

  return {
    error: errorState.error,
    isError: errorState.isError,
    setError,
    clearError,
    resetError,
    hasError: () => errorState.isError,
  };
}

/**
 * Use async error hook
 */
export function useAsyncError() {
  const { error, isError, setError, clearError } = useError();

  const runAsync = useCallback(
    async <T>(fn: () => Promise<T>): Promise<T> => {
      clearError();
      try {
        return await fn();
      } catch (error) {
        setError(error);
        throw error;
      }
    },
    [setError, clearError]
  );

  return {
    error,
    isError,
    runAsync,
    clearError,
  };
}

/**
 * Use retry hook
 */
export function useRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    delay?: number;
    onRetry?: (attempt: number, error: Error) => void;
    onSuccess?: (result: T) => void;
    onError?: (error: Error) => void;
  } = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const execute = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setRetryCount(0);

    try {
      const result = await retryWithBackoff(fn, {
        maxRetries: options.maxRetries || 3,
        baseDelay: options.delay || 1000,
        onRetry: (attempt, error) => {
          setRetryCount(attempt);
          options.onRetry?.(attempt, error);
        },
      });

      setData(result);
      options.onSuccess?.(result);
      return result;
    } catch (err) {
      const appError = toAppError(err);
      setError(appError);
      options.onError?.(appError);
      throw appError;
    } finally {
      setIsLoading(false);
    }
  }, [fn, options]);

  const retry = useCallback(() => {
    execute();
  }, [execute]);

  return {
    data,
    error,
    isLoading,
    retryCount,
    execute,
    retry,
    reset: () => {
      setData(null);
      setError(null);
      setRetryCount(0);
    },
  };
}

/**
 * Use API call hook with retry
 */
export function useAPICall<T>(
  fn: () => Promise<T>,
  options: {
    enabled?: boolean;
    refetchInterval?: number;
    onSuccess?: (result: T) => void;
    onError?: (error: Error) => void;
  } = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const execute = useCallback(async () => {
    if (options.enabled === false) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await retryAPICall(fn);
      setData(result);
      options.onSuccess?.(result);
      return result;
    } catch (err) {
      const appError = toAppError(err);
      setError(appError);
      options.onError?.(appError);
      throw appError;
    } finally {
      setIsLoading(false);
    }
  }, [fn, options]);

  // Auto-execute on mount and refetch interval
  useEffect(() => {
    execute();

    if (options.refetchInterval) {
      const interval = setInterval(execute, options.refetchInterval);
      return () => clearInterval(interval);
    }
  }, [execute, options.refetchInterval]);

  return {
    data,
    error,
    isLoading,
    execute,
    refetch: execute,
  };
}

/**
 * Use database operation hook with retry
 */
export function useDatabaseOperation<T>(
  fn: () => Promise<T>,
  options: {
    onSuccess?: (result: T) => void;
    onError?: (error: Error) => void;
  } = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const execute = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await retryDatabaseOperation(fn);
      setData(result);
      options.onSuccess?.(result);
      return result;
    } catch (err) {
      const appError = toAppError(err);
      setError(appError);
      options.onError?.(appError);
      throw appError;
    } finally {
      setIsLoading(false);
    }
  }, [fn, options]);

  return {
    data,
    error,
    isLoading,
    execute,
  };
}

/**
 * Use sync operation hook with retry
 */
export function useSyncOperation<T>(
  fn: () => Promise<T>,
  options: {
    onSuccess?: (result: T) => void;
    onError?: (error: Error) => void;
  } = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const execute = useCallback(async () => {
    setIsLoading(true);
    setIsSyncing(true);
    setError(null);

    try {
      const result = await retrySyncOperation(fn);
      setData(result);
      options.onSuccess?.(result);
      return result;
    } catch (err) {
      const appError = toAppError(err);
      setError(appError);
      options.onError?.(appError);
      throw appError;
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
    }
  }, [fn, options]);

  return {
    data,
    error,
    isLoading,
    isSyncing,
    execute,
  };
}

/**
 * Use error recovery hook
 */
export function useErrorRecovery(operationId: string) {
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryStats, setRecoveryStats] = useState(() =>
    globalRecoveryManager.getRecoveryStats(operationId)
  );

  const executeWithRecovery = useCallback(
    async <T>(fn: () => Promise<T>, customConfig?: Parameters<typeof executeWithGlobalRecovery>[2]) => {
      setIsRecovering(true);
      try {
        const result = await executeWithGlobalRecovery(operationId, fn, customConfig);
        setRecoveryStats(globalRecoveryManager.getRecoveryStats(operationId));
        return result;
      } finally {
        setIsRecovering(false);
      }
    },
    [operationId]
  );

  const getHistory = useCallback(() => {
    return globalRecoveryManager.getRecoveryHistory(operationId);
  }, [operationId]);

  const getSuccessRate = useCallback(() => {
    return globalRecoveryManager.getRecoverySuccessRate(operationId);
  }, [operationId]);

  const clearHistory = useCallback(() => {
    globalRecoveryManager.clearRecoveryHistory(operationId);
    setRecoveryStats({ success: 0, failure: 0 });
  }, [operationId]);

  return {
    isRecovering,
    recoveryStats,
    executeWithRecovery,
    getHistory,
    getSuccessRate,
    clearHistory,
  };
}

/**
 * Use error boundary hook
 */
export function useErrorBoundary() {
  const [error, setError] = useState<Error | null>(null);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  const captureError = useCallback((error: Error) => {
    setError(error);
  }, []);

  return {
    error,
    hasError: error !== null,
    resetError,
    captureError,
  };
}

/**
 * Use online status hook for error recovery
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    isOnline,
    isOffline: !isOnline,
  };
}

/**
 * Use error logging hook
 */
export function useErrorLogger() {
  const logError = useCallback((error: Error, context?: Record<string, unknown>) => {
    const appError = toAppError(error);

    // Log to console
    console.error('Error logged:', {
      error: appError.toJSON(),
      context,
      timestamp: new Date().toISOString(),
    });

    // Send to error tracking service (placeholder)
    // This is where you would integrate with Sentry, LogRocket, etc.
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(appError, {
        contexts: { custom: context },
      });
    }
  }, []);

  const logInfo = useCallback((message: string, data?: Record<string, unknown>) => {
    console.info('Info logged:', {
      message,
      data,
      timestamp: new Date().toISOString(),
    });
  }, []);

  const logWarning = useCallback((message: string, data?: Record<string, unknown>) => {
    console.warn('Warning logged:', {
      message,
      data,
      timestamp: new Date().toISOString(),
    });
  }, []);

  return {
    logError,
    logInfo,
    logWarning,
  };
}

/**
 * Use error toast hook (placeholder for toast notifications)
 */
export function useErrorToast() {
  const showToast = useCallback((error: Error, options?: { duration?: number }) => {
    const appError = toAppError(error);
    const message = getErrorMessage(appError);

    // This is a placeholder - integrate with your toast library
    // For example: toast.error(message, { duration: options?.duration || 5000 })

    console.error('Toast shown:', message);
  }, []);

  const showSuccess = useCallback((message: string, options?: { duration?: number }) => {
    // This is a placeholder - integrate with your toast library
    // For example: toast.success(message, { duration: options?.duration || 3000 })

    console.log('Success toast shown:', message);
  }, []);

  const showInfo = useCallback((message: string, options?: { duration?: number }) => {
    // This is a placeholder - integrate with your toast library
    // For example: toast.info(message, { duration: options?.duration || 3000 })

    console.log('Info toast shown:', message);
  }, []);

  return {
    showToast,
    showSuccess,
    showInfo,
  };
}

/**
 * Comprehensive error handling hook
 */
export function useErrorHandler() {
  const error = useError();
  const asyncError = useAsyncError();
  const onlineStatus = useOnlineStatus();
  const errorLogger = useErrorLogger();
  const errorToast = useErrorToast();

  const handleError = useCallback(
    (err: Error | unknown, context?: Record<string, unknown>) => {
      const appError = toAppError(err);

      // Log error
      errorLogger.logError(appError, context);

      // Show toast
      errorToast.showToast(appError);

      // Update error state
      error.setError(appError);

      return appError;
    },
    [errorLogger, errorToast, error]
  );

  const handleAsyncError = useCallback(
    async <T>(fn: () => Promise<T>, context?: Record<string, unknown>): Promise<T> => {
      return asyncError.runAsync(async () => {
        try {
          return await fn();
        } catch (err) {
          handleError(err, context);
          throw err;
        }
      });
    },
    [asyncError, handleError]
  );

  return {
    // Error state
    error: error.error,
    isError: error.isError,

    // Error handling
    handleError,
    handleAsyncError,
    clearError: error.clearError,
    resetError: error.resetError,

    // Async operations
    runAsync: asyncError.runAsync,

    // Online status
    isOnline: onlineStatus.isOnline,
    isOffline: onlineStatus.isOffline,

    // Logging
    logError: errorLogger.logError,
    logInfo: errorLogger.logInfo,
    logWarning: errorLogger.logWarning,

    // Toasts
    showToast: errorToast.showToast,
    showSuccess: errorToast.showSuccess,
    showInfo: errorToast.showInfo,
  };
}

/**
 * Use error metrics hook
 */
export function useErrorMetrics() {
  const [metrics, setMetrics] = useState(() => ({
    totalErrors: 0,
    errorsByType: {} as Record<string, number>,
    errorsByCode: {} as Record<string, number>,
    recentErrors: [] as Array<{ error: Error; timestamp: number }>,
  }));

  const recordError = useCallback((error: Error) => {
    const appError = toAppError(error);
    const errorCode = getErrorCode(appError);

    setMetrics(prev => ({
      totalErrors: prev.totalErrors + 1,
      errorsByType: {
        ...prev.errorsByType,
        [appError.name]: (prev.errorsByType[appError.name] || 0) + 1,
      },
      errorsByCode: {
        ...prev.errorsByCode,
        [errorCode]: (prev.errorsByCode[errorCode] || 0) + 1,
      },
      recentErrors: [
        { error: appError, timestamp: Date.now() },
        ...prev.recentErrors.slice(0, 9), // Keep last 10 errors
      ],
    }));
  }, []);

  const clearMetrics = useCallback(() => {
    setMetrics({
      totalErrors: 0,
      errorsByType: {},
      errorsByCode: {},
      recentErrors: [],
    });
  }, []);

  const getErrorRate = useCallback((timeWindow: number = 60000) => {
    const now = Date.now();
    const recentErrorsInWindow = metrics.recentErrors.filter(
      e => now - e.timestamp <= timeWindow
    );
    return recentErrorsInWindow.length;
  }, [metrics.recentErrors]);

  return {
    metrics,
    recordError,
    clearMetrics,
    getErrorRate,
  };
}