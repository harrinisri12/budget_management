import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an unhandled rendering error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          style={{
            minHeight: '60vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            backgroundColor: 'var(--bg-page, #F8FAFC)'
          }}
        >
          <div
            className="cbm-card"
            style={{
              maxWidth: 580,
              width: '100%',
              padding: '32px 28px',
              textAlign: 'center',
              borderRadius: 'var(--radius-lg, 12px)',
              boxShadow: 'var(--shadow-md, 0 4px 6px -1px rgba(0,0,0,0.1))',
              backgroundColor: 'white'
            }}
          >
            <div
              style={{
                width: 54,
                height: 54,
                borderRadius: '50%',
                backgroundColor: 'var(--danger-bg, #FEF2F2)',
                color: 'var(--danger, #DC2626)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16
              }}
            >
              <AlertTriangle size={28} />
            </div>

            <h2
              style={{
                fontSize: 19,
                fontWeight: 700,
                color: 'var(--text-heading, #0F172A)',
                margin: '0 0 8px 0'
              }}
            >
              Something went wrong loading this view
            </h2>

            <p
              style={{
                fontSize: 13.5,
                color: 'var(--text-muted, #64748B)',
                margin: '0 0 20px 0',
                lineHeight: 1.5
              }}
            >
              An unexpected error occurred while rendering the page. You can reload the view or return to the main dashboard.
            </p>

            {this.state.error?.message && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: 6,
                  backgroundColor: 'var(--bg-page, #F1F5F9)',
                  border: '1px solid var(--border, #E2E8F0)',
                  color: 'var(--danger, #DC2626)',
                  fontSize: 12.5,
                  fontFamily: 'monospace',
                  textAlign: 'left',
                  marginBottom: 20,
                  wordBreak: 'break-word'
                }}
              >
                {this.state.error.message}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={this.handleReload}
                className="cbm-btn cbm-btn-primary"
                style={{ height: 38, padding: '0 18px', display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <RefreshCw size={15} />
                <span>Reload Page</span>
              </button>

              <a
                href="/faculty/dashboard"
                className="cbm-btn cbm-btn-outline"
                style={{ height: 38, padding: '0 18px', display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}
              >
                <Home size={15} />
                <span>Go to Dashboard</span>
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
