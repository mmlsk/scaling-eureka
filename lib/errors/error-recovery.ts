// Error recovery mechanisms and utilities

import { AppError, toAppError, getErrorCode, getErrorMessage } from './custom-errors';

/**
 * Recovery strategy type
 */
export type RecoveryStrategy =
  | 'retry'
  | 'fallback'
  | 'ignore'
  | 'notify'
  | 'restart'
  | 'degrade';

/**
 * Recovery action result
 */
export interface RecoveryResult {
  success: boolean;
  strategy: RecoveryStrategy;
  error?: Error;
  timestamp: number;
}

/**
 * Recovery configuration
 */
export interface RecoveryConfig {
  strategy: RecoveryStrategy;
  maxAttempts?: number;
  timeout?: number;
  fallbackValue?: unknown;
  onRecovery?: (result: RecoveryResult) => void;
  onFailure?: (error: Error) => void;
}

/**
 * Default recovery configurations for different error types
 */
const DEFAULT_RECOVERY_CONFIGS: Record<string, RecoveryConfig> = {
  NETWORK_ERROR: {
    strategy: 'retry',
    maxAttempts: 3,
    timeout: 10000,
  },
  TIMEOUT_ERROR: {
    strategy: 'retry',
    maxAttempts: 2,
    timeout: 5000,
  },
  RATE_LIMIT_ERROR: {
    strategy: 'retry',
    maxAttempts: 5,
    timeout: 60000,
  },
  VALIDATION_ERROR: {
    strategy: 'fallback',
    fallbackValue: null,
  },
  AUTH_ERROR: {
    strategy: 'notify',
  },
  AUTHORIZATION_ERROR: {
    strategy: 'notify',
  },
  NOT_FOUND_ERROR: {
    strategy: 'fallback',
    fallbackValue: null,
  },
  DATABASE_ERROR: {
    strategy: 'retry',
    maxAttempts: 2,
    timeout: 2000,
  },
  SYNC_ERROR: {
    strategy: 'retry',
    maxAttempts: 5,
    timeout: 30000,
  },
  CACHE_ERROR: {
    strategy: 'fallback',
    fallbackValue: null,
  },
  STATE_ERROR: {
    strategy: 'restart',
  },
  CONFIGURATION_ERROR: {
    strategy: 'notify',
  },
  SERVICE_UNAVAILABLE_ERROR: {
    strategy: 'retry',
    maxAttempts: 3,
    timeout: 15000,
  },
  PARSE_ERROR: {
    strategy: 'fallback',
    fallbackValue: null,
  },
  CONCURRENCY_ERROR: {
    strategy: 'retry',
    maxAttempts: 2,
    timeout: 1000,
  },
  BUSINESS_LOGIC_ERROR: {
    strategy: 'notify',
  },
};

/**
 * Get recovery configuration for error
 */
export function getRecoveryConfig(error: Error): RecoveryConfig {
  const appError = toAppError(error);
  return (
    DEFAULT_RECOVERY_CONFIGS[appError.code] || {
      strategy: 'notify',
    }
  );
}

/**
 * Execute recovery strategy
 */
export async function executeRecovery<T>(
  error: Error,
  operation: () => Promise<T>,
  customConfig?: Partial<RecoveryConfig>
): Promise<T> {
  const appError = toAppError(error);
  const config = { ...getRecoveryConfig(appError), ...customConfig };

  const result: RecoveryResult = {
    success: false,
    strategy: config.strategy,
    error,
    timestamp: Date.now(),
  };

  try {
    switch (config.strategy) {
      case 'retry':
        return await executeRetryRecovery(operation, config, result);

      case 'fallback':
        return await executeFallbackRecovery(operation, config, result);

      case 'ignore':
        result.success = true;
        config.onRecovery?.(result);
        return undefined as T;

      case 'notify':
        result.success = false;
        config.onFailure?.(error);
        config.onRecovery?.(result);
        throw error;

      case 'restart':
        return await executeRestartRecovery(operation, config, result);

      case 'degrade':
        return await executeDegradeRecovery(operation, config, result);

      default:
        throw new Error(`Unknown recovery strategy: ${config.strategy}`);
    }
  } catch (recoveryError) {
    result.error = recoveryError instanceof Error ? recoveryError : new Error(String(recoveryError));
    result.success = false;
    config.onFailure?.(result.error);
    config.onRecovery?.(result);
    throw recoveryError;
  }
}

/**
 * Execute retry recovery
 */
async function executeRetryRecovery<T>(
  operation: () => Promise<T>,
  config: RecoveryConfig,
  result: RecoveryResult
): Promise<T> {
  const maxAttempts = config.maxAttempts || 3;
  const timeout = config.timeout || 5000;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const value = await Promise.race([
        operation(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Recovery timeout')), timeout)
        ),
      ]);

      result.success = true;
      config.onRecovery?.(result);
      return value;
    } catch (error) {
      if (attempt === maxAttempts) {
        throw error;
      }
      // Wait before next attempt
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }

  throw new Error('Max retry attempts exceeded');
}

/**
 * Execute fallback recovery
 */
async function executeFallbackRecovery<T>(
  operation: () => Promise<T>,
  config: RecoveryConfig,
  result: RecoveryResult
): Promise<T> {
  try {
    const value = await operation();
    result.success = true;
    config.onRecovery?.(result);
    return value;
  } catch (error) {
    // Return fallback value
    result.success = true;
    config.onRecovery?.(result);
    return config.fallbackValue as T;
  }
}

/**
 * Execute restart recovery
 */
async function executeRestartRecovery<T>(
  operation: () => Promise<T>,
  config: RecoveryConfig,
  result: RecoveryResult
): Promise<T> {
  try {
    // Clear any cached state
    if (typeof window !== 'undefined') {
      // Clear relevant caches
      // This is a placeholder - implement based on your needs
    }

    // Retry operation
    const value = await operation();
    result.success = true;
    config.onRecovery?.(result);
    return value;
  } catch (error) {
    result.success = false;
    throw error;
  }
}

/**
 * Execute degrade recovery
 */
async function executeDegradeRecovery<T>(
  operation: () => Promise<T>,
  config: RecoveryConfig,
  result: RecoveryResult
): Promise<T> {
  try {
    const value = await operation();
    result.success = true;
    config.onRecovery?.(result);
    return value;
  } catch (error) {
    // Return degraded functionality
    result.success = true;
    config.onRecovery?.(result);
    // This is a placeholder - implement based on your needs
    return config.fallbackValue as T;
  }
}

/**
 * Error recovery manager
 */
export class ErrorRecoveryManager {
  private recoveryHistory: Map<string, RecoveryResult[]> = new Map();
  private recoveryStats: Map<string, { success: number; failure: number }> = new Map();

  /**
   * Execute operation with automatic recovery
   */
  async executeWithRecovery<T>(
    operationId: string,
    operation: () => Promise<T>,
    customConfig?: Partial<RecoveryConfig>
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      const appError = toAppError(error);
      const result = await executeRecovery(appError, operation, customConfig);

      // Record recovery history
      this.recordRecovery(operationId, result);

      return result as T;
    }
  }

  /**
   * Record recovery attempt
   */
  private recordRecovery(operationId: string, result: RecoveryResult): void {
    if (!this.recoveryHistory.has(operationId)) {
      this.recoveryHistory.set(operationId, []);
    }

    this.recoveryHistory.get(operationId)!.push(result);

    // Update stats
    const stats = this.recoveryStats.get(operationId) || { success: 0, failure: 0 };
    if (result.success) {
      stats.success++;
    } else {
      stats.failure++;
    }
    this.recoveryStats.set(operationId, stats);
  }

  /**
   * Get recovery history for operation
   */
  getRecoveryHistory(operationId: string): RecoveryResult[] {
    return this.recoveryHistory.get(operationId) || [];
  }

  /**
   * Get recovery statistics for operation
   */
  getRecoveryStats(operationId: string): { success: number; failure: number } {
    return this.recoveryStats.get(operationId) || { success: 0, failure: 0 };
  }

  /**
   * Get all recovery statistics
   */
  getAllRecoveryStats(): Map<string, { success: number; failure: number }> {
    return new Map(this.recoveryStats);
  }

  /**
   * Clear recovery history for operation
   */
  clearRecoveryHistory(operationId: string): void {
    this.recoveryHistory.delete(operationId);
    this.recoveryStats.delete(operationId);
  }

  /**
   * Clear all recovery history
   */
  clearAllRecoveryHistory(): void {
    this.recoveryHistory.clear();
    this.recoveryStats.clear();
  }

  /**
   * Get recovery success rate for operation
   */
  getRecoverySuccessRate(operationId: string): number {
    const stats = this.getRecoveryStats(operationId);
    const total = stats.success + stats.failure;
    return total > 0 ? stats.success / total : 0;
  }
}

/**
 * Global error recovery manager instance
 */
export const globalRecoveryManager = new ErrorRecoveryManager();

/**
 * Execute operation with global recovery manager
 */
export async function executeWithGlobalRecovery<T>(
  operationId: string,
  operation: () => Promise<T>,
  customConfig?: Partial<RecoveryConfig>
): Promise<T> {
  return globalRecoveryManager.executeWithRecovery(operationId, operation, customConfig);
}

/**
 * Create a recovery-aware function
 */
export function createRecoveryAwareFunction<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  operationId: string,
  customConfig?: Partial<RecoveryConfig>
): T {
  return (async (...args: Parameters<T>) => {
    return executeWithGlobalRecovery(
      operationId,
      () => fn(...args),
      customConfig
    );
  }) as T;
}

/**
 * Batch recovery - execute multiple operations with recovery
 */
export async function batchRecovery<T>(
  operations: Array<{
    id: string;
    operation: () => Promise<T>;
    config?: Partial<RecoveryConfig>;
  }>
): Promise<Array<{ id: string; success: boolean; result?: T; error?: Error }>> {
  const results = await Promise.allSettled(
    operations.map(({ id, operation, config }) =>
      executeWithGlobalRecovery(id, operation, config)
    )
  );

  return operations.map(({ id }, index) => {
    const result = results[index];
    if (result.status === 'fulfilled') {
      return { id, success: true, result: result.value };
    } else {
      return { id, success: false, error: result.reason };
    }
  });
}

/**
 * Recovery with health check
 */
export async function recoveryWithHealthCheck<T>(
  operation: () => Promise<T>,
  healthCheck: () => Promise<boolean>,
  customConfig?: Partial<RecoveryConfig>
): Promise<T> {
  const isHealthy = await healthCheck();

  if (!isHealthy) {
    throw new Error('System is not healthy');
  }

  try {
    return await operation();
  } catch (error) {
    const appError = toAppError(error);
    return executeRecovery(appError, operation, customConfig);
  }
}

/**
 * Recovery with cache fallback
 */
export async function recoveryWithCacheFallback<T>(
  operation: () => Promise<T>,
  getFromCache: () => T | null,
  saveToCache: (value: T) => void,
  customConfig?: Partial<RecoveryConfig>
): Promise<T> {
  try {
    const value = await operation();
    saveToCache(value);
    return value;
  } catch (error) {
    const appError = toAppError(error);

    // Try to get from cache
    const cachedValue = getFromCache();
    if (cachedValue !== null) {
      return cachedValue;
    }

    // If no cache, try recovery
    return executeRecovery(appError, operation, customConfig);
  }
}

/**
 * Recovery with graceful degradation
 */
export async function recoveryWithDegradation<T>(
  primaryOperation: () => Promise<T>,
  fallbackOperation: () => Promise<T>,
  customConfig?: Partial<RecoveryConfig>
): Promise<T> {
  try {
    return await primaryOperation();
  } catch (error) {
    const appError = toAppError(error);

    try {
      return await fallbackOperation();
    } catch (fallbackError) {
      // Both failed, try recovery
      return executeRecovery(appError, primaryOperation, customConfig);
    }
  }
}