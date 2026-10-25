import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, AlertCircle, KeyRound } from 'lucide-react';
import { PasswordInput } from '../components/common/PasswordInput';
import { Button } from '../components/common/Button';
import { useAuth } from '../context/AuthContext';

export const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const { updatePassword } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!password) {
      setError('Password is required.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    const result = await updatePassword(password);
    setIsLoading(false);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      setError(result.message || 'Failed to update password.');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
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
          width: '100%',
          maxWidth: 420,
          padding: '20px 24px',
          boxShadow: 'var(--shadow-modal)',
          position: 'relative',
          zIndex: 10
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 14 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--gold)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              marginBottom: 8
            }}
          >
            <KeyRound size={18} />
          </div>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-heading)', margin: 0 }}>
            Reset Account Password
          </h2>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, marginBottom: 0 }}>
            Enter your new credentials for the Kongu Budget Portal.
          </p>
        </div>

        {success ? (
          <div
            style={{
              padding: '12px 14px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--success-bg)',
              border: '1px solid var(--success-border)',
              color: 'var(--success-text)',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 6
            }}
          >
            <CheckCircle2 size={22} color="var(--success)" />
            <p style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>Password Updated Successfully</p>
            <p style={{ fontSize: 11.5, color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
              Redirecting to authentication portal...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {error && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--danger-bg)',
                  border: '1px solid var(--danger-border)',
                  color: 'var(--danger-text)',
                  fontSize: 12.5,
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <PasswordInput
              id="new-password"
              label="New Password"
              placeholder="Enter at least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <PasswordInput
              id="confirm-password"
              label="Confirm New Password"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              icon={ArrowRight}
              style={{ height: 42, fontSize: 13.5, marginTop: 4 }}
            >
              Update Password
            </Button>

            <div style={{ textAlign: 'center', marginTop: 8 }}>
              <button
                type="button"
                onClick={() => navigate('/login')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary)',
                  fontWeight: 600,
                  fontSize: 12.5,
                  cursor: 'pointer'
                }}
              >
                Back to Sign In
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};


