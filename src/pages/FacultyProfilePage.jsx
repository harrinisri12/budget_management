import React, { useState } from 'react';
import { FacultyLayout } from '../components/layout/FacultyLayout';
import { useAuth } from '../context/AuthContext';
import { Mail, Shield, Building, UserCheck, AlertCircle, CheckCircle } from 'lucide-react';
import { PasswordInput } from '../components/common/PasswordInput';
import { Button } from '../components/common/Button';

export const FacultyProfilePage = () => {
  const { user, updatePassword } = useAuth();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    if (!newPassword) {
      setMessage({ text: 'Please enter a new password.', type: 'error' });
      return;
    }
    if (newPassword.length < 6) {
      setMessage({ text: 'Password must be at least 6 characters long.', type: 'error' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ text: 'Passwords do not match.', type: 'error' });
      return;
    }

    setLoading(true);
    const result = await updatePassword(newPassword);
    setLoading(false);

    if (result.success) {
      setMessage({ text: 'Your account password has been updated successfully.', type: 'success' });
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setMessage({ text: result.message || 'Failed to update password.', type: 'error' });
    }
  };

  return (
    <FacultyLayout pageTitle="Faculty Profile">
      <div style={{ maxWidth: 840, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.05em' }}>
              OFFICIAL FACULTY RECORD
            </span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-heading)' }}>Faculty Profile & Credentials</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
            Your official Kongu Engineering College faculty portal record and account security settings.
          </p>
        </div>

        <hr className="cbm-divider" />

        {/* SECTION 1: Profile Info */}
        <section className="cbm-section">
          <div className="cbm-section-header">
            <div>
              <h2 className="cbm-section-title">Faculty Member Record</h2>
              <p className="cbm-section-subtitle">
                Departmental affiliation and official contact credentials
              </p>
            </div>
          </div>

          {/* Details Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ width: 34, height: 34, borderRadius: 6, backgroundColor: 'var(--gold-subtle)', color: 'var(--gold-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--gold-border)', flexShrink: 0 }}>
                <UserCheck size={16} />
              </div>
              <div>
                <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Faculty Name</span>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-heading)', marginTop: 1 }}>{user?.name || 'Faculty Member'}</p>
                <span style={{ fontSize: 12, color: 'var(--gold-text)', fontWeight: 600 }}>{user?.designation || 'Faculty Member'}</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ width: 34, height: 34, borderRadius: 6, backgroundColor: 'var(--gold-subtle)', color: 'var(--gold-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--gold-border)', flexShrink: 0 }}>
                <Mail size={16} />
              </div>
              <div>
                <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Institutional Email</span>
                <p style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-heading)', marginTop: 1, wordBreak: 'break-all' }}>{user?.email || 'faculty@kongu.edu'}</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ width: 34, height: 34, borderRadius: 6, backgroundColor: 'var(--gold-subtle)', color: 'var(--gold-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--gold-border)', flexShrink: 0 }}>
                <Building size={16} />
              </div>
              <div>
                <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Department</span>
                <p style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-heading)', marginTop: 1 }}>
                  {user?.department || 'Computer Science and Engineering (CSE)'}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ width: 34, height: 34, borderRadius: 6, backgroundColor: 'var(--gold-subtle)', color: 'var(--gold-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--gold-border)', flexShrink: 0 }}>
                <Shield size={16} />
              </div>
              <div>
                <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Employee ID</span>
                <p style={{ fontSize: 13.5, fontWeight: 700, fontFamily: 'monospace', color: 'var(--text-heading)', marginTop: 1 }}>{user?.employeeId || 'FAC001'}</p>
              </div>
            </div>
          </div>
        </section>

        <hr className="cbm-divider" />

        {/* SECTION 2: Change Password */}
        <section className="cbm-section">
          <div className="cbm-section-header">
            <div>
              <h2 className="cbm-section-title">Security & Account Password</h2>
              <p className="cbm-section-subtitle">
                Update your faculty portal authentication password
              </p>
            </div>
          </div>

          <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {message.text && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '12px 14px',
                  borderRadius: 6,
                  backgroundColor: message.type === 'error' ? 'var(--danger-bg)' : '#F0FDF4',
                  border: message.type === 'error' ? '1px solid rgba(220, 38, 38, 0.2)' : '1px solid rgba(22, 163, 74, 0.2)',
                  color: message.type === 'error' ? 'var(--danger-text)' : '#16A34A',
                  fontSize: 13.5,
                  fontWeight: 600
                }}
              >
                {message.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
                <span>{message.text}</span>
              </div>
            )}

            <PasswordInput
              label="New Password"
              placeholder="Enter at least 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />

            <PasswordInput
              label="Confirm New Password"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 8 }}>
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? 'Updating Password...' : 'Update Password'}
              </Button>
            </div>
          </form>
        </section>
      </div>
    </FacultyLayout>
  );
};

