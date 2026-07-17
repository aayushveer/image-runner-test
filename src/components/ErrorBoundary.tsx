import React, { Component, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  theme?: 'dark' | 'light';
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const isDark = this.props.theme === 'dark';
      return (
        <div className={`min-h-screen flex items-center justify-center p-6 ${
          isDark ? 'bg-[#131314] text-[#e3e3e3]' : 'bg-[#f8f9fa] text-[#1f1f1f]'
        }`}>
          <div className={`max-w-md w-full rounded-3xl p-8 text-center ${
            isDark ? 'bg-[#1e1f20] border border-[#2d2f31]' : 'bg-white border border-[#dadce0] shadow-sm'
          }`}>
            <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <span className="text-3xl">⚠️</span>
            </div>
            <h2 className="font-display font-bold text-xl mb-3 text-slate-900 dark:text-white">
              Something went wrong
            </h2>
            <p className={`text-sm mb-6 leading-relaxed ${
              isDark ? 'text-[#c4c7c5]' : 'text-slate-600'
            }`}>
              An unexpected error occurred. This is likely due to a browser compatibility issue or a temporary glitch.
            </p>
            {this.state.error && (
              <details className={`mb-6 text-left text-xs p-3 rounded-xl border ${
                isDark ? 'bg-[#131314] border-[#3c4043]' : 'bg-gray-50 border-[#dadce0]'
              }`}>
                <summary className="cursor-pointer font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  Technical details
                </summary>
                <pre className="mt-2 font-mono text-[10px] leading-relaxed text-red-600 dark:text-red-400 whitespace-pre-wrap break-all">
                  {this.state.error.message}
                </pre>
              </details>
            )}
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-sm font-semibold bg-[#1a73e8] hover:bg-[#1557b0] text-white shadow-sm transition-all active:scale-[0.98] cursor-pointer"
            >
              🔄 Reload App
            </button>
            <p className={`text-[10px] mt-4 font-medium ${
              isDark ? 'text-[#9aa0a6]' : 'text-slate-400'
            }`}>
              Your images are safe — they never leave your device.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
