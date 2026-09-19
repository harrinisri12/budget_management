import React from 'react';
import { FacultyLayout } from '../components/layout/FacultyLayout';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, Building, Phone, BadgeCheck } from 'lucide-react';

export const FacultyProfilePage = () => {
  const { user } = useAuth();

  return (
    <FacultyLayout pageTitle="Faculty Profile">
      <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--dark)' }}>Faculty Profile</h1>
          <p style={{ fontSize: 14, color: 'var(--dark-muted)', marginTop: 4 }}>
            Your official Kongu Engineering College faculty portal record.
          </p>
        </div>

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
      </div>
    </FacultyLayout>
  );
};
