import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Home } from 'lucide-react';

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--background)',
        padding: 24,
        textAlign: 'center'
      }}
    >
      <div className="cbm-card" style={{ padding: 48, maxWidth: 500, width: '100%' }}>
        <h1 style={{ fontSize: 64, fontWeight: 800, color: 'var(--primary)', marginBottom: 8 }}>404</h1>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Page Not Found</h2>
        <p style={{ color: 'var(--dark-muted)', marginBottom: 24 }}>
          The institutional budget resource page you requested could not be found.
        </p>
        <Button variant="primary" icon={Home} onClick={() => navigate('/dashboard')}>
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
};
