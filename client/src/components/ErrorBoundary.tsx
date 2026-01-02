import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Error boundary that catches React rendering errors and displays a fallback UI.
 * Prevents the entire app from crashing due to component errors.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#2a2558] to-[#5F52B2] p-8">
          <div className="max-w-md rounded-card border border-ui-glassBorder bg-ui-glass p-8 text-center backdrop-blur-glass">
            <h1 className="mb-4 font-poppins text-2xl font-semibold text-white">
              Something went wrong
            </h1>
            <p className="mb-6 font-manrope text-white/80">
              We encountered an unexpected error. Please refresh the page to try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="rounded-pill bg-ui-overlay px-6 py-3 font-poppins text-white transition-all hover:bg-ui-overlayHover"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
