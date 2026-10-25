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
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.05em' }}>
              OFFICIAL FACULTY RECORD
            </span>
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-heading)', margin: 0 }}>Faculty Profile & Credentials</h1>
          <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 4, marginBottom: 0 }}>
            Your official Kongu Engineering College faculty portal record and account security settings.
          </p>
        </div>

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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 6, backgroundColor: 'var(--gold-subtle)', color: 'var(--gold-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--gold-border)', flexShrink: 0 }}>
                <UserCheck size={15} />
              </div>
              <div>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Faculty Name</span>
                <p style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-heading)', margin: '1px 0 0 0' }}>{user?.name || 'Faculty Member'}</p>
                <span style={{ fontSize: 11.5, color: 'var(--gold-text)', fontWeight: 600 }}>{user?.designation || 'Faculty Member'}</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 6, backgroundColor: 'var(--gold-subtle)', color: 'var(--gold-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--gold-border)', flexShrink: 0 }}>
                <Mail size={15} />
              </div>
              <div>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Institutional Email</span>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-heading)', margin: '1px 0 0 0', wordBreak: 'break-all' }}>{user?.email || '—'}</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 6, backgroundColor: 'var(--gold-subtle)', color: 'var(--gold-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--gold-border)', flexShrink: 0 }}>
                <Building size={15} />
              </div>
              <div>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Department</span>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-heading)', margin: '1px 0 0 0' }}>
                  {user?.department || 'Computer Science and Engineering (CSE)'}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 6, backgroundColor: 'var(--gold-subtle)', color: 'var(--gold-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--gold-border)', flexShrink: 0 }}>
                <Shield size={15} />
              </div>
              <div>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Employee ID</span>
                <p style={{ fontSize: 13, fontWeight: 700, fontFamily: 'monospace', color: 'var(--text-heading)', margin: '1px 0 0 0' }}>{user?.employeeId || user?.employee_id || '—'}</p>
              </div>
            </div>
          </div>
        </section>

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

          <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {message.text && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 14px',
                  borderRadius: 6,
                  backgroundColor: message.type === 'error' ? 'var(--danger-bg)' : '#F0FDF4',
                  border: message.type === 'error' ? '1px solid rgba(220, 38, 38, 0.2)' : '1px solid rgba(22, 163, 74, 0.2)',
                  color: message.type === 'error' ? 'var(--danger-text)' : '#16A34A',
                  fontSize: 12.5,
                  fontWeight: 600
                }}
              >
                {message.type === 'error' ? <AlertCircle size={15} /> : <CheckCircle size={15} />}
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
              <Button variant="primary" type="submit" disabled={loading} style={{ height: 38, padding: '0 18px', fontSize: 13 }}>
                {loading ? 'Updating Password...' : 'Update Password'}
              </Button>
            </div>
          </form>
        </section>
      </div>
    </FacultyLayout>
  );
};

