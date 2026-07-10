import { Component, type ReactNode, type ErrorInfo } from 'react';
import { HiExclamationTriangle, HiArrowPath } from 'react-icons/hi2';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="min-h-[40vh] flex flex-col items-center justify-center text-center px-6">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/15 flex items-center justify-center mb-4">
            <HiExclamationTriangle className="w-8 h-8 text-rose-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
          <p className="text-sm text-gray-500 mb-6 max-w-md">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button
            onClick={this.handleRetry}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors"
          >
            <HiArrowPath className="w-4 h-4" />
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
