import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { AddFacultyForm } from '../components/faculty/AddFacultyForm';
import { ArrowLeft, UserPlus } from 'lucide-react';

export const AddFacultyPage = () => {
  const navigate = useNavigate();

  return (
    <DashboardLayout pageTitle="Add Faculty Member">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 900, margin: '0 auto' }}>
        {/* Back Link */}
        <button
          onClick={() => navigate('/faculty')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'none',
            border: 'none',
            color: 'var(--dark)',
            fontWeight: 600,
            fontSize: 13.5,
            cursor: 'pointer',
            alignSelf: 'flex-start'
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Faculty Directory</span>
        </button>

        {/* Card Form Container */}
        <div className="cbm-card" style={{ padding: 'clamp(18px, 3vw, 32px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'gap', gap: 14, marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 8,
                backgroundColor: 'var(--gold-subtle)',
                border: '1px solid var(--gold-border)',
                color: 'var(--gold-text)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <UserPlus size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-heading)' }}>Add New Faculty Member</h2>
              <p style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
                Register a new teaching faculty member. The Faculty role is automatically assigned.
              </p>
            </div>
          </div>

          <AddFacultyForm
            initialRole="faculty"
            lockRole={true}
            onCancel={() => navigate('/faculty')}
            onSuccess={() => navigate('/faculty')}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};
