'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AppError, toAppError, getErrorMessage } from './custom-errors';

/**
 * Error boundary props
 */
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKeys?: Array<string | number>;
  resetOnPropsChange?: boolean;
}

/**
 * Error boundary state
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Default error fallback component
 */
function DefaultErrorFallback({
  error,
  resetError,
}: {
  error: Error;
  resetError: () => void;
}) {
  return (
    <div className="error-boundary-fallback" style={{
      padding: '2rem',
      margin: '1rem',
      border: '1px solid #ef4444',
      borderRadius: '0.5rem',
      backgroundColor: '#fef2f2',
    }}>
      <h2 style={{ color: '#dc2626', marginTop: 0 }}>
        Something went wrong
      </h2>
      <p style={{ color: '#991b1b' }}>
        {getErrorMessage(error)}
      </p>
      <button
        onClick={resetError}
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#dc2626',
          color: 'white',
          border: 'none',
          borderRadius: '0.25rem',
          cursor: 'pointer',
          marginTop: '1rem',
        }}
      >
        Try again
      </button>
    </div>
  );
}

/**
 * Error Boundary Component
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  private lastResetKey: string;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
    this.lastResetKey = this.getResetKey();
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Convert to AppError if needed
    const appError = toAppError(error);

    // Log error
    console.error('ErrorBoundary caught an error:', appError);
    console.error('Error Info:', errorInfo);

    // Call custom error handler
    this.props.onError?.(appError, errorInfo);

    // Update state with error info
    this.setState({
      error: appError,
      errorInfo,
    });
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetKeys, resetOnPropsChange } = this.props;
    const currentResetKey = this.getResetKey();

    // Reset on resetKeys change
    if (resetKeys && currentResetKey !== this.lastResetKey) {
      this.lastResetKey = currentResetKey;
      this.resetError();
    }

    // Reset on props change if enabled
    if (resetOnPropsChange && prevProps !== this.props) {
      this.resetError();
    }
  }

  getResetKey(): string {
    const { resetKeys } = this.props;
    return resetKeys ? JSON.stringify(resetKeys) : '';
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (hasError && error) {
      // Use custom fallback if provided
      if (fallback) {
        return <>{fallback}</>;
      }

      // Use default fallback
      return <DefaultErrorFallback error={error} resetError={this.resetError} />;
    }

    return <>{children}</>;
  }
}

/**
 * Higher-order component for error boundaries
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  return function WithErrorBoundaryWrapper(props: P) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

/**
 * Hook for error boundary functionality
 */
export function useErrorHandler() {
  return (error: Error) => {
    throw error; // This will be caught by the nearest ErrorBoundary
  };
}

/**
 * Async error boundary for handling async errors
 */
export class AsyncErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    super.componentDidCatch?.(error, errorInfo);
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (hasError && error) {
      if (fallback) {
        return <>{fallback}</>;
      }
      return <DefaultErrorFallback error={error} resetError={this.resetError} />;
    }

    return <>{children}</>;
  }
}

/**
 * Error boundary specifically for API errors
 */
export function APIErrorBoundary({
  children,
  fallback,
  onError,
}: {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: AppError) => void;
}) {
  return (
    <ErrorBoundary
      fallback={
        fallback || (
          <div className="api-error-fallback" style={{
            padding: '2rem',
            margin: '1rem',
            border: '1px solid #f59e0b',
            borderRadius: '0.5rem',
            backgroundColor: '#fef3c7',
          }}>
            <h2 style={{ color: '#d97706', marginTop: 0 }}>
              API Error
            </h2>
            <p style={{ color: '#92400e' }}>
              Failed to load data. Please check your connection and try again.
            </p>
          </div>
        )
      }
      onError={(error, errorInfo) => {
        const appError = toAppError(error);
        if (appError.code === 'API_ERROR' || appError.code === 'NETWORK_ERROR') {
          onError?.(appError);
        }
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * Error boundary specifically for sync errors
 */
export function SyncErrorBoundary({
  children,
  fallback,
  onError,
}: {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: AppError) => void;
}) {
  return (
    <ErrorBoundary
      fallback={
        fallback || (
          <div className="sync-error-fallback" style={{
            padding: '2rem',
            margin: '1rem',
            border: '1px solid #8b5cf6',
            borderRadius: '0.5rem',
            backgroundColor: '#f5f3ff',
          }}>
            <h2 style={{ color: '#7c3aed', marginTop: 0 }}>
              Sync Error
            </h2>
            <p style={{ color: '#6d28d9' }}>
              Failed to sync your data. Your changes are saved locally and will sync when connection is restored.
            </p>
          </div>
        )
      }
      onError={(error, errorInfo) => {
        const appError = toAppError(error);
        if (appError.code === 'SYNC_ERROR') {
          onError?.(appError);
        }
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * Error boundary specifically for validation errors
 */
export function ValidationErrorBoundary({
  children,
  fallback,
  onError,
}: {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: AppError) => void;
}) {
  return (
    <ErrorBoundary
      fallback={
        fallback || (
          <div className="validation-error-fallback" style={{
            padding: '2rem',
            margin: '1rem',
            border: '1px solid #ec4899',
            borderRadius: '0.5rem',
            backgroundColor: '#fdf2f8',
          }}>
            <h2 style={{ color: '#db2777', marginTop: 0 }}>
              Validation Error
            </h2>
            <p style={{ color: '#be185d' }}>
              Please check your input and try again.
            </p>
          </div>
        )
      }
      onError={(error, errorInfo) => {
        const appError = toAppError(error);
        if (appError.code === 'VALIDATION_ERROR') {
          onError?.(appError);
        }
      }}
    >
      {children}
    </ErrorBoundary>
  );
}