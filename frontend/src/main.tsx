import React, { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class RootErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#0c0a1d',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
          padding: '20px',
          textAlign: 'center'
        }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '12px' }}>
            CodeTrack Platform Ready
          </h1>
          <p style={{ color: '#a78bfa', maxWidth: '600px', marginBottom: '15px', lineHeight: '1.5' }}>
            The application encountered an initialization error. Please reload to connect to live data.
          </p>
          {this.state.error && (
            <div style={{
              backgroundColor: '#171430',
              border: '1px solid #3b2d68',
              borderRadius: '8px',
              padding: '12px',
              maxWidth: '700px',
              width: '100%',
              textAlign: 'left',
              marginBottom: '20px',
              overflowX: 'auto'
            }}>
              <p style={{ color: '#f87171', fontFamily: 'monospace', fontSize: '13px', margin: '0 0 6px 0', fontWeight: 'bold' }}>
                {this.state.error.name}: {this.state.error.message}
              </p>
              <pre style={{ color: '#9ca3af', fontFamily: 'monospace', fontSize: '11px', margin: 0, whiteSpace: 'pre-wrap' }}>
                {this.state.error.stack}
              </pre>
            </div>
          )}
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = '/';
            }}
            style={{
              padding: '10px 20px',
              backgroundColor: '#9333ea',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Reset Storage & Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RootErrorBoundary>
      <App />
    </RootErrorBoundary>
  </React.StrictMode>,
)
