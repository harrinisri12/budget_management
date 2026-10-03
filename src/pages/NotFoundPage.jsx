import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Home, AlertCircle } from 'lucide-react';

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: '100vh',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        textAlign: 'center',
        backgroundColor: 'var(--bg-page)'
      }}
    >
      {/* Background College Campus Image with 60% Blur & Soft Translucent Overlay */}
      <div className="cbm-bg-canvas" aria-hidden="true">
        <div className="cbm-bg-image" />
        <div className="cbm-bg-overlay" />
      </div>

      <div
        className="cbm-card"
        style={{
          padding: '36px 40px',
          maxWidth: 460,
          width: '100%',
          boxShadow: 'var(--shadow-modal)',
          position: 'relative',
          zIndex: 10
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--gold-subtle)',
            color: 'var(--gold-text)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
            border: '1px solid var(--gold-border)'
          }}
        >
          <AlertCircle size={26} />
        </div>
        <h1 style={{ fontSize: 40, fontWeight: 800, color: 'var(--text-heading)', marginBottom: 4, letterSpacing: '-0.03em' }}>404</h1>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-heading)', marginBottom: 8 }}>Page Not Found</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 24, lineHeight: 1.5 }}>
          The institutional budget resource page you requested does not exist or has been relocated.
        </p>
        <Button variant="primary" icon={Home} onClick={() => navigate('/dashboard')}>
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
};


