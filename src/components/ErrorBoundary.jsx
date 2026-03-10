import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('App crash:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 p-6">
          <div className="max-w-[720px] w-full glass-card rounded-3xl p-8 border-2 border-primary/20">
            <h1 className="text-2xl font-bold mb-3">Something went wrong</h1>
            <p className="text-sm text-slate-500 mb-4">
              The app crashed while rendering. Check the browser console for the exact error.
            </p>
            <pre className="text-xs bg-slate-100 dark:bg-slate-800 p-3 rounded overflow-x-auto">
              {String(this.state.error || 'Unknown error')}
            </pre>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
