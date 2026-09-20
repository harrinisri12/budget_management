import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GraduationCap, Mail, ArrowRight, ShieldCheck, PieChart, CheckCircle2, AlertCircle, KeyRound } from 'lucide-react';
import { Input } from '../components/common/Input';
import { PasswordInput } from '../components/common/PasswordInput';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';

export const LoginPage = ({ initialMode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginFaculty, resetPassword } = useAuth();

  // Determine initial mode: prop -> path / query -> default 'admin'
  const getInitialRole = () => {
    if (initialMode) return initialMode;
    if (location.pathname.includes('faculty')) return 'faculty';
    const params = new URLSearchParams(location.search);
    if (params.get('role') === 'faculty') return 'faculty';
    return 'admin';
  };

  const [mode, setMode] = useState(getInitialRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Forgot Password modal states
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [isSendingReset, setIsSendingReset] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Email address is required.');
      return;
    }
    if (!password) {
      setError('Password is required.');
      return;
    }

    setIsLoading(true);

    try {
      if (mode === 'admin') {
        const result = await login(email, password);
        setIsLoading(false);

        if (result.success) {
          navigate('/dashboard');
        } else {
          setError(result.message || 'Invalid email or password.');
        }
      } else {
        const result = await loginFaculty(email, password);
        setIsLoading(false);

        if (result.success) {
          navigate('/faculty/dashboard');
        } else {
          setError(result.message || 'Invalid email or password.');
        }
      }
    } catch (err) {
      setIsLoading(false);
      setError(err.message || 'Login failed.');
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');

    if (!forgotEmail.trim()) {
      setForgotError('Please enter your registered email address.');
      return;
    }

    setIsSendingReset(true);
    const res = await resetPassword(forgotEmail);
    setIsSendingReset(false);

    if (res.success) {
      setForgotSuccess(res.message);
    } else {
      setForgotError(res.message);
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
          maxWidth: 1040,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          borderRadius: 24,
          overflow: 'hidden',
          boxShadow: '0 20px 50px -10px rgba(68, 60, 222, 0.12)',
          border: '1px solid var(--border)'
        }}
      >
        {/* Left Side: Branding & Institutional Visual Panel (Desktop) */}
        <div
          style={{
            backgroundColor: '#13141D',
            color: '#FFFFFF',
            padding: '52px 44px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden'
          }}
          className="hidden md:flex"
        >
          {/* Subtle background glow */}
          <div
            style={{
              position: 'absolute',
              top: -60,
              right: -60,
              width: 300,
              height: 300,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(68,60,222,0.3) 0%, rgba(19,20,29,0) 70%)',
              pointerEvents: 'none'
            }}
          />

          {/* Top Brand Header */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 12,
                  backgroundColor: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 16px rgba(68, 60, 222, 0.4)'
                }}
              >
                <GraduationCap size={26} color="#FFFFFF" />
              </div>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.01em' }}>
                  Kongu Engineering College
                </h3>
                <p style={{ fontSize: 11, color: 'var(--secondary)', letterSpacing: '0.08em', fontWeight: 600, marginTop: 2 }}>
                  AUTONOMOUS INSTITUTION
                </p>
              </div>
            </div>
          </div>

          {/* Institutional Highlights */}
          <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div
              style={{
                padding: '18px 20px',
                borderRadius: 14,
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: 14
              }}
            >
              <PieChart size={26} style={{ color: 'var(--primary)' }} />
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#FFFFFF' }}>₹24.5 Lakhs Allocated</p>
                <p style={{ fontSize: 12, color: '#ABA7CD' }}>CSE Department FY 2026-27 Budget</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 20, fontSize: 13, color: '#ABA7CD', paddingTop: 8 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle2 size={16} style={{ color: '#10B981' }} /> Audit Ready
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <ShieldCheck size={16} style={{ color: 'var(--primary)' }} /> Institutional Security
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form Panel */}
        <div style={{ padding: '48px 44px', backgroundColor: '#FFFFFF', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          
          {/* Mobile Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }} className="md:hidden">
            <GraduationCap size={28} color="var(--primary)" />
            <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--dark)' }}>CSE Budget Management</span>
          </div>

          {/* Segmented Switch (Admin / Faculty) */}
          <div
            role="tablist"
            aria-label="Login Role Selection"
            style={{
              position: 'relative',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              backgroundColor: '#F3F4F8',
              borderRadius: 12,
              padding: 4,
              marginBottom: 28,
              border: '1px solid #E5E3F0'
            }}
          >
            {/* Animated active sliding pill */}
            <div
              style={{
                position: 'absolute',
                top: 4,
                bottom: 4,
                left: 4,
                width: 'calc(50% - 4px)',
                backgroundColor: '#4F46E5',
                borderRadius: 8,
                transform: mode === 'admin' ? 'translateX(0%)' : 'translateX(100%)',
                transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 2px 8px rgba(79, 70, 229, 0.3)',
                zIndex: 1,
                pointerEvents: 'none'
              }}
            />

            {/* Admin Option */}
            <button
              type="button"
              role="tab"
              id="role-tab-admin"
              aria-selected={mode === 'admin'}
              onClick={() => {
                setMode('admin');
                setError('');
              }}
              style={{
                position: 'relative',
                zIndex: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '10px 16px',
                fontSize: 14.5,
                fontWeight: mode === 'admin' ? 600 : 500,
                color: mode === 'admin' ? '#FFFFFF' : '#4B4963',
                background: 'transparent',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                transition: 'color 0.2s ease',
                fontFamily: 'inherit'
              }}
            >
              <ShieldCheck size={17} />
              <span>Admin</span>
            </button>

            {/* Faculty Option */}
            <button
              type="button"
              role="tab"
              id="role-tab-faculty"
              aria-selected={mode === 'faculty'}
              onClick={() => {
                setMode('faculty');
                setError('');
              }}
              style={{
                position: 'relative',
                zIndex: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '10px 16px',
                fontSize: 14.5,
                fontWeight: mode === 'faculty' ? 600 : 500,
                color: mode === 'faculty' ? '#FFFFFF' : '#4B4963',
                background: 'transparent',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                transition: 'color 0.2s ease',
                fontFamily: 'inherit'
              }}
            >
              <GraduationCap size={17} />
              <span>Faculty</span>
            </button>
          </div>

          {/* Heading */}
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 30, fontWeight: 800, color: 'var(--dark)', marginBottom: 8 }}>
              Welcome Back
            </h2>
            <p style={{ fontSize: 14.5, color: 'var(--dark-muted)' }}>
              {mode === 'admin'
                ? 'Sign in to manage your CSE department budget'
                : 'Sign in to manage department proposals and activities'}
            </p>
          </div>

          {/* Error Message Area */}
          {error && (
            <div
              style={{
                padding: '14px 18px',
                borderRadius: 10,
                backgroundColor: 'var(--danger-bg)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: 'var(--danger-text)',
                fontSize: 13.5,
                fontWeight: 600,
                marginBottom: 24,
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Email Address */}
            <Input
              id="login-email"
              label="Email Address"
              type="email"
              placeholder={mode === 'admin' ? 'Enter your email address' : 'Enter your Kongu email'}
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
            />

            {/* Password Input with show/hide toggle */}
            <div>
              <PasswordInput
                id="login-password"
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />

              {/* Forgot Password Link */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(email);
                    setForgotError('');
                    setForgotSuccess('');
                    setShowForgotModal(true);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary)',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  Forgot Password?
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              icon={ArrowRight}
              style={{ marginTop: 8, height: 52, fontSize: 16, backgroundColor: '#4F46E5' }}
            >
              Sign In
            </Button>
          </form>

          {/* Institutional footer note */}
          <div style={{ marginTop: 36, textAlign: 'center', fontSize: 12.5, color: 'var(--secondary)', fontWeight: 500 }}>
            Kongu Engineering College • CSE Department Portal
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <Modal
          isOpen={showForgotModal}
          onClose={() => setShowForgotModal(false)}
          title="Reset Account Password"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <p style={{ fontSize: 14, color: 'var(--dark-muted)' }}>
              Enter your registered Kongu institutional email address. We will dispatch a password recovery link to your inbox.
            </p>

            {forgotError && (
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: 8,
                  backgroundColor: 'var(--danger-bg)',
                  color: 'var(--danger-text)',
                  fontSize: 13,
                  fontWeight: 600
                }}
              >
                ⚠️ {forgotError}
              </div>
            )}

            {forgotSuccess && (
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: 8,
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  color: '#047857',
                  fontSize: 13,
                  fontWeight: 600
                }}
              >
                ✓ {forgotSuccess}
              </div>
            )}

            <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Input
                label="Email Address"
                type="email"
                placeholder="name@kongu.edu"
                icon={Mail}
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
                <Button type="button" variant="outline" onClick={() => setShowForgotModal(false)}>
                  Close
                </Button>
                <Button type="submit" variant="primary" isLoading={isSendingReset} icon={KeyRound}>
                  Send Reset Link
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
};
