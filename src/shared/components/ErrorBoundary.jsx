import { useTranslation } from 'react-i18next';
import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(_error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught Error:", error, errorInfo);
        this.setState({ error, errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    height: '100vh',
                    width: '100vw',
                    background: '#0f172a',
                    color: '#e2e8f0',
                    fontFamily: "'Share Tech Mono', monospace",
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    padding: '2rem'
                }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem', color: '#EF4444' }}>{t('auto.system_critical', 'SYSTEM CRITICAL')}</div>
                    <div style={{ fontSize: '1.2rem', color: '#94a3b8', marginBottom: '2rem' }}>
                        NEURAL LINK SEVERED. EXECUTION HALTED.
                    </div>

                    <div style={{
                        background: 'rgba(0,0,0,0.3)',
                        padding: '1rem',
                        borderRadius: '8px',
                        border: '1px solid #334155',
                        maxWidth: '800px',
                        textAlign: 'left',
                        overflow: 'auto',
                        maxHeight: '400px'
                    }}>
                        <h3 style={{ color: '#F87171', marginTop: 0 }}>{t('auto.error_trace', 'ERROR TRACE:')}</h3>
                        <pre style={{ color: '#FCA5A5', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                            {this.state.error && this.state.error.toString()}
                        </pre>
                        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #334155', fontSize: '0.8rem', color: '#64748B' }}>
                            {this.state.errorInfo && this.state.errorInfo.componentStack}
                        </div>
                    </div>

                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            marginTop: '2rem',
                            padding: '12px 24px',
                            background: '#2563EB',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '1rem',
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                            boxShadow: '0 0 15px rgba(37, 99, 235, 0.5)'
                        }}
                    >
                        INITIATE SYSTEM REBOOT
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
