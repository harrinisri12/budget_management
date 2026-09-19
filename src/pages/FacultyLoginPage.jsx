import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Mail, ArrowRight, ShieldCheck, PieChart, CheckCircle2 } from 'lucide-react';
import { Input } from '../components/common/Input';
import { PasswordInput } from '../components/common/PasswordInput';
import { Button } from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { useBudget } from '../context/BudgetContext';

export const FacultyLoginPage = () => {
  const navigate = useNavigate();
  const { loginFaculty } = useAuth();
  const { facultyList } = useBudget();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
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

    setTimeout(() => {
      const result = loginFaculty(email, password, facultyList);
      setIsLoading(false);

      if (result.success) {
        navigate('/faculty/dashboard');
      } else {
        setError(result.message);
      }
    }, 600);
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

        {/* Right Side: Faculty Login Form Panel */}
        <div style={{ padding: '56px 48px', backgroundColor: '#FFFFFF', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ marginBottom: 36 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }} className="md:hidden">
              <GraduationCap size={28} color="var(--primary)" />
              <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--dark)' }}>CSE Budget Management</span>
            </div>
            <h2 style={{ fontSize: 30, fontWeight: 800, color: 'var(--dark)', marginBottom: 8 }}>
              Welcome, Faculty
            </h2>
            <p style={{ fontSize: 14.5, color: 'var(--dark-muted)' }}>
              Sign in to submit and manage your department proposals.
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
              <span>⚠️ {error}</span>
            </div>
          )}

          {/* Faculty Login Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Email Input */}
            <Input
              label="Email Address"
              type="email"
              placeholder="Enter your Kongu email"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {/* Password Input with show/hide toggle */}
            <PasswordInput
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              icon={ArrowRight}
              style={{ marginTop: 12, height: 52, fontSize: 16 }}
            >
              Sign In
            </Button>
          </form>

          {/* Switch to Admin Login */}
          <div style={{ marginTop: 20, textAlign: 'center' }}>
            <span style={{ fontSize: 14, color: 'var(--dark-muted)' }}>
              Are you an administrator?{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: 0,
                  fontSize: 14
                }}
              >
                Admin Login
              </button>
            </span>
          </div>

          {/* Institutional footer note */}
          <div style={{ marginTop: 44, textAlign: 'center', fontSize: 12.5, color: 'var(--secondary)', fontWeight: 500 }}>
            Kongu Engineering College • CSE Department Faculty Portal
          </div>
        </div>
      </div>
    </div>
  );
};
