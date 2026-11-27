import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

/**
 * Production Error Boundary so KiranaFlow never renders a blank white screen.
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    message: '',
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  public componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('KiranaFlow UI error:', error, info);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#fbf9f3] flex items-center justify-center p-6">
          <div className="max-w-sm w-full bg-white border border-[#dedad1] rounded-xl p-6 shadow-sm space-y-4">
            <p className="font-display text-xs uppercase tracking-widest text-[#b54a42]">
              Recovery Mode
            </p>
            <h1 className="font-display text-xl font-semibold text-[#1b1c18]">
              Something interrupted the ledger
            </h1>
            <p className="text-sm text-[#444748]">
              {this.state.message || 'An unexpected display error occurred. Your saved database records are safe.'}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="w-full py-2.5 px-4 rounded-lg bg-[#1c1b1b] text-white font-display text-sm font-medium"
            >
              Reload KiranaFlow
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
