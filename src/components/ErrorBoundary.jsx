import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary] Crash:', error, info?.componentStack);
    this.setState({ info });
  }

  handleReset = () => {
    this.setState({ error: null, info: null });
  };

  render() {
    const { error, info } = this.state;

    if (!error) return this.props.children;

    return (
      <div style={{
        minHeight: '100vh', background: '#F5F5F7',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px 20px',
      }}>
        <div style={{ maxWidth: 480, width: '100%' }}>
          <div style={{
            background: '#fff', borderRadius: 20,
            border: '1px solid rgba(255,59,48,0.2)',
            padding: '28px 24px',
            boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: 'rgba(255,59,48,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, fontSize: 20,
              }}>⚠️</div>
              <div>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#1D1D1F' }}>
                  Ceva a mers prost
                </h2>
                <p style={{ margin: '2px 0 0', fontSize: 13, color: '#AEAEB2' }}>
                  A apărut o eroare neașteptată
                </p>
              </div>
            </div>

            <div style={{
              background: '#F9F9F9', borderRadius: 12, padding: '14px 16px',
              marginBottom: 20, border: '1px solid #E5E5EA',
            }}>
              <p style={{ margin: 0, fontSize: 13, color: '#FF3B30', fontFamily: 'monospace', wordBreak: 'break-all', lineHeight: 1.5 }}>
                {error.message || String(error)}
              </p>
              {info?.componentStack && (
                <details style={{ marginTop: 10 }}>
                  <summary style={{ fontSize: 12, color: '#AEAEB2', cursor: 'pointer' }}>Stack trace</summary>
                  <pre style={{ fontSize: 11, color: '#6E6E73', marginTop: 8, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                    {info.componentStack.trim()}
                  </pre>
                </details>
              )}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={this.handleReset}
                style={{
                  flex: 1, background: '#0071E3', color: '#fff', border: 'none',
                  borderRadius: 14, padding: '13px', fontSize: 15, fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Încearcă din nou
              </button>
              <button
                onClick={() => { localStorage.clear(); window.location.href = '/'; }}
                style={{
                  flex: 1, background: 'none', color: '#FF3B30',
                  border: '1.5px solid rgba(255,59,48,0.3)',
                  borderRadius: 14, padding: '13px', fontSize: 15, fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Resetează aplicația
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
