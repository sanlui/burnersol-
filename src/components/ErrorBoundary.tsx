import * as React from "react";
import { Link } from "react-router-dom";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };
  props!: ErrorBoundaryProps;

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.warn("ErrorBoundary caught an error:", error, errorInfo?.componentStack);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-screen bg-dark-obsidian text-slate-300 antialiased font-sans flex flex-col items-center justify-center">
          <div className="text-center space-y-6 p-8 max-w-lg">
            <div className="space-y-2">
              <h1 className="text-4xl font-display font-black italic text-white">
                System Fault
              </h1>
              <p className="text-slate-400 text-sm">
                An unexpected error occurred. The protocol remains secure and your funds are safe.
              </p>
            </div>
            {this.state.error && (
              <div className="border border-white/10 bg-white/5 p-4 rounded-none">
                <p className="text-xs font-mono text-slate-500">
                  {this.state.error.message}
                </p>
              </div>
            )}
            <div className="flex gap-4 justify-center">
              <Link
                to="/"
                className="px-6 py-3 bg-flame-orange hover:bg-orange-600 text-black font-display font-bold text-xs tracking-wider uppercase transition-all"
              >
                Return Home
              </Link>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 border border-white/20 hover:border-white hover:bg-white hover:text-black text-white font-display font-bold text-xs tracking-wider uppercase transition-all"
              >
                Reload
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}