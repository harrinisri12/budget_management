import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
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
      setError('Password must be at least 6 characters.');
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
      }, 2500);
    } else {
      setError(result.message || 'Failed to update password.');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        backgroundColor: '#F1EFFD',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}
    >
      <div
        className="cbm-card"
        style={{
          width: '100%',
          maxWidth: 480,
          padding: '44px',
          borderRadius: 24,
          backgroundColor: '#FFFFFF',
          boxShadow: '0 20px 50px -10px rgba(68, 60, 222, 0.12)',
          border: '1px solid var(--border)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              backgroundColor: 'var(--primary)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              marginBottom: 16,
              boxShadow: '0 4px 16px rgba(68, 60, 222, 0.3)'
            }}
          >
            <GraduationCap size={28} />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--dark)' }}>
            Reset Your Password
          </h2>
          <p style={{ fontSize: 13.5, color: 'var(--dark-muted)', marginTop: 4 }}>
            Enter your new password for your Kongu Budget Management account.
          </p>
        </div>

        {success ? (
          <div
            style={{
              padding: '20px',
              borderRadius: 12,
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#047857',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 10
            }}
          >
            <CheckCircle2 size={32} color="#10B981" />
            <p style={{ fontSize: 15, fontWeight: 700 }}>Password Updated Successfully!</p>
            <p style={{ fontSize: 13, color: '#047857' }}>
              Redirecting you to login page...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {error && (
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: 10,
                  backgroundColor: 'var(--danger-bg)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: 'var(--danger-text)',
                  fontSize: 13.5,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <PasswordInput
              id="new-password"
              label="New Password"
              placeholder="Enter new password"
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
              style={{ height: 50, fontSize: 15, marginTop: 8 }}
            >
              Update Password
            </Button>

            <div style={{ textAlign: 'center', marginTop: 12 }}>
              <button
                type="button"
                onClick={() => navigate('/login')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary)',
                  fontWeight: 600,
                  fontSize: 13.5,
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
