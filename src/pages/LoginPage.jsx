import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GraduationCap, Mail, ArrowRight, ShieldCheck, PieChart, CheckCircle2, AlertCircle, KeyRound, Building, Lock } from 'lucide-react';
import { Input } from '../components/common/Input';
import { PasswordInput } from '../components/common/PasswordInput';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { LegalModal } from '../components/common/LegalModal';
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
  const [showLegalModal, setShowLegalModal] = useState(false);
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

    if (!email.includes('@')) {
      if (mode === 'faculty') {
        setError('Faculty login requires your institutional email address (@kongu.edu). Faculty ID / Employee ID cannot be used to log in.');
      } else {
        setError('Please enter a valid email address.');
      }
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

      <div className="cbm-auth-card" style={{ position: 'relative', zIndex: 10 }}>
        {/* Left Side: Institutional Administrative Panel (Desktop) */}
        <div
          style={{
            backgroundColor: '#121212',
            color: '#FFFFFF',
            padding: '44px 36px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            borderRight: '1px solid #27272A'
          }}
          className="hidden md:flex"
        >
          {/* Top Institutional Header */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--gold)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  flexShrink: 0
                }}
              >
                <Building size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#FFFFFF', lineHeight: 1.2 }}>
                  Kongu Engineering College
                </h3>
                <p style={{ fontSize: 11, color: 'var(--gold)', fontWeight: 700, letterSpacing: '0.04em', marginTop: 2 }}>
                  DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING
                </p>
              </div>
            </div>

            <div style={{ marginTop: 28 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#FFFFFF', lineHeight: 1.3 }}>
                Department Budget Management System
              </h2>
              <p style={{ fontSize: 13, color: '#A1A1AA', marginTop: 8, lineHeight: 1.6 }}>
                Official internal administrative portal for managing departmental budget allocations, academic year quotas, faculty activity proposals, and audit disbursements.
              </p>
            </div>
          </div>

          {/* Institutional Highlights */}
          <div style={{ marginTop: 36, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div
              style={{
                padding: '14px 16px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(197, 160, 89, 0.25)',
                display: 'flex',
                alignItems: 'center',
                gap: 12
              }}
            >
              <PieChart size={20} style={{ color: 'var(--gold)', flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: 13.5, fontWeight: 600, color: '#FFFFFF' }}>FY 2026-27 Academic Allocation</p>
                <p style={{ fontSize: 12, color: '#A1A1AA' }}>CSE Departmental Quota Management</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 18, fontSize: 12, color: '#A1A1AA', paddingTop: 6 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <CheckCircle2 size={14} style={{ color: 'var(--gold)' }} /> Audit Compliant
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <ShieldCheck size={14} style={{ color: 'var(--gold)' }} /> Institutional Access
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form Panel */}
        <div style={{ padding: '36px 32px', backgroundColor: 'var(--bg-surface)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          
          {/* Mobile Institutional Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }} className="md:hidden">
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF'
              }}
            >
              <Building size={16} />
            </div>
            <div>
              <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-heading)' }}>Kongu Engineering College</span>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>CSE Budget Portal</div>
            </div>
          </div>

          {/* Segmented Switch (Admin / Faculty) */}
          <div
            role="tablist"
            aria-label="Login Role Selection"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              backgroundColor: 'var(--slate-100)',
              borderRadius: 'var(--radius-sm)',
              padding: 3,
              marginBottom: 24,
              border: '1px solid var(--border)'
            }}
          >
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
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                padding: '8px 12px',
                fontSize: 13,
                fontWeight: mode === 'admin' ? 700 : 500,
                color: mode === 'admin' ? 'var(--gold-text)' : 'var(--text-muted)',
                backgroundColor: mode === 'admin' ? 'var(--bg-surface)' : 'transparent',
                border: mode === 'admin' ? '1px solid var(--gold-border)' : '1px solid transparent',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                boxShadow: mode === 'admin' ? 'var(--shadow-xs)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <ShieldCheck size={15} style={{ color: mode === 'admin' ? 'var(--gold)' : 'inherit' }} />
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
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                padding: '8px 12px',
                fontSize: 13,
                fontWeight: mode === 'faculty' ? 700 : 500,
                color: mode === 'faculty' ? 'var(--gold-text)' : 'var(--text-muted)',
                backgroundColor: mode === 'faculty' ? 'var(--bg-surface)' : 'transparent',
                border: mode === 'faculty' ? '1px solid var(--gold-border)' : '1px solid transparent',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                boxShadow: mode === 'faculty' ? 'var(--shadow-xs)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <GraduationCap size={15} style={{ color: mode === 'faculty' ? 'var(--gold)' : 'inherit' }} />
              <span>Faculty</span>
            </button>
          </div>

          {/* Heading */}
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-heading)', marginBottom: 4 }}>
              {mode === 'admin' ? 'Administrator Sign In' : 'Faculty Member Sign In'}
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              {mode === 'admin'
                ? 'Sign in to access department budget allocations and proposal approvals'
                : 'Sign in with your @kongu.edu institutional email to manage proposals'}
            </p>
          </div>

          {/* Error Message Area */}
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
                marginBottom: 18,
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
              role="alert"
            >
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Email Address */}
            <Input
              id="login-email"
              label="Institutional Email Address"
              type="email"
              placeholder={mode === 'admin' ? 'admin@kongu.edu' : 'facultyname@kongu.edu'}
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
            />

            {/* Password Input */}
            <div>
              <PasswordInput
                id="login-password"
                label="Account Password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />

              {/* Forgot Password Link */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
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
                    fontSize: 12,
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
              style={{ marginTop: 6, height: 42, fontSize: 13.5 }}
            >
              Sign In
            </Button>
          </form>

          {/* Institutional footer note with Legal Policies trigger */}
          <div style={{ marginTop: 24, paddingTop: 14, borderTop: '1px solid var(--border)', textAlign: 'center', fontSize: 11.5, color: 'var(--text-muted)' }}>
            <p>Kongu Engineering College • Internal CSE System</p>
            <button
              type="button"
              onClick={() => setShowLegalModal(true)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary)',
                fontSize: 11.5,
                fontWeight: 600,
                cursor: 'pointer',
                marginTop: 4,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              <Lock size={11} />
              <span>Privacy Policy & Terms of Use</span>
            </button>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <Modal
          isOpen={showForgotModal}
          onClose={() => setShowForgotModal(false)}
          title="Reset Account Password"
          maxWidth="500px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Enter your registered Kongu institutional email address. A password recovery link will be dispatched to your inbox.
            </p>

            {forgotError && (
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
                <span>{forgotError}</span>
              </div>
            )}

            {forgotSuccess && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--success-bg)',
                  border: '1px solid var(--success-border)',
                  color: 'var(--success-text)',
                  fontSize: 12.5,
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                <CheckCircle2 size={15} style={{ flexShrink: 0 }} />
                <span>{forgotSuccess}</span>
              </div>
            )}

            <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Input
                label="Registered Email Address"
                type="email"
                placeholder="name@kongu.edu"
                icon={Mail}
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
                <Button type="button" variant="outline" onClick={() => setShowForgotModal(false)} size="sm">
                  Cancel
                </Button>
                <Button type="submit" variant="primary" isLoading={isSendingReset} icon={KeyRound} size="sm">
                  Send Recovery Link
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      )}

      {/* Institutional Legal Modal */}
      {showLegalModal && (
        <LegalModal
          isOpen={showLegalModal}
          onClose={() => setShowLegalModal(false)}
        />
      )}
    </div>
  );
};
