import React, { useState } from 'react';
import { FacultyLayout } from '../components/layout/FacultyLayout';
import { useAuth } from '../context/AuthContext';
import { Mail, Shield, Building, Phone, Key, CheckCircle, AlertCircle } from 'lucide-react';
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
      setMessage({ text: 'Password must be at least 6 characters.', type: 'error' });
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
      setMessage({ text: 'Your account password has been updated successfully!', type: 'success' });
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setMessage({ text: result.message || 'Failed to update password.', type: 'error' });
    }
  };

  return (
    <FacultyLayout pageTitle="Faculty Profile">
      <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--dark)' }}>Faculty Profile</h1>
          <p style={{ fontSize: 14, color: 'var(--dark-muted)', marginTop: 4 }}>
            Your official Kongu Engineering College faculty portal record & account settings.
          </p>
        </div>

        {/* Profile Info Card */}
        <div className="cbm-card" style={{ padding: '36px' }}>
          {/* Header info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, paddingBottom: 28, borderBottom: '1px solid var(--border)' }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 18,
                backgroundColor: 'rgba(68, 60, 222, 0.1)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 26,
                fontWeight: 800
              }}
            >
              {user?.name ? user.name.charAt(0) : 'F'}
            </div>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--dark)' }}>{user?.name || 'Faculty Member'}</h2>
              <p style={{ fontSize: 13.5, color: 'var(--primary)', fontWeight: 700, marginTop: 2 }}>
                {user?.designation || 'Professor'} • {user?.employeeId || 'FAC001'}
              </p>
            </div>
          </div>

          {/* Details Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24, paddingTop: 28 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <Mail size={20} style={{ color: 'var(--primary)', marginTop: 2 }} />
              <div>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--secondary)', textTransform: 'uppercase' }}>Email Address</span>
                <p style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--dark)', marginTop: 2 }}>{user?.email || 'faculty@kongu.edu'}</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <Building size={20} style={{ color: 'var(--primary)', marginTop: 2 }} />
              <div>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--secondary)', textTransform: 'uppercase' }}>Department</span>
                <p style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--dark)', marginTop: 2 }}>
                  {user?.department || 'Computer Science and Engineering (CSE)'}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <Shield size={20} style={{ color: 'var(--primary)', marginTop: 2 }} />
              <div>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--secondary)', textTransform: 'uppercase' }}>Institution</span>
                <p style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--dark)', marginTop: 2 }}>Kongu Engineering College</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <Phone size={20} style={{ color: 'var(--primary)', marginTop: 2 }} />
              <div>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--secondary)', textTransform: 'uppercase' }}>Phone</span>
                <p style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--dark)', marginTop: 2 }}>{user?.phone || '+91 98421 12345'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="cbm-card" style={{ padding: '36px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ padding: 10, borderRadius: 10, backgroundColor: 'rgba(68, 60, 222, 0.1)', color: 'var(--primary)' }}>
              <Key size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--dark)' }}>Security & Password</h3>
              <p style={{ fontSize: 13, color: 'var(--secondary)' }}>Update your faculty account password for security</p>
            </div>
          </div>

          <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {message.text && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '12px 16px',
                  borderRadius: 10,
                  backgroundColor: message.type === 'error' ? '#FEE2E2' : '#DCFCE7',
                  color: message.type === 'error' ? '#DC2626' : '#16A34A',
                  fontSize: 13.5,
                  fontWeight: 600
                }}
              >
                {message.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
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
        </div>
      </div>
    </FacultyLayout>
  );
};
