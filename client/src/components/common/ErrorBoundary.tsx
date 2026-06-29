import { Component, type ReactNode, type ErrorInfo } from 'react';
import ErrorState from './ErrorState';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;         // Optional custom fallback
  onReset?: () => void;         // Optional reset callback
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return { 
      hasError: true, 
      error: error instanceof Error ? error : new Error(String(error)) 
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // In production this would send to an error tracking service
    // e.g. Sentry.captureException(error, { extra: info });
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex min-h-[60vh] items-center justify-center p-8">
          <ErrorState
            title="Something went wrong"
            description={
              this.state.error?.message ||
              'An unexpected error occurred. Please try refreshing the page.'
            }
            onRetry={this.handleReset}
            retryLabel="Try again"
          />
        </div>
      );
    }
    return this.props.children;
  }
}
