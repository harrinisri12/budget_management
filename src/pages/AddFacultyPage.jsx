import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { AddFacultyForm } from '../components/faculty/AddFacultyForm';
import { ArrowLeft, UserPlus } from 'lucide-react';

export const AddFacultyPage = () => {
  const navigate = useNavigate();

  return (
    <DashboardLayout pageTitle="Add Faculty Member">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 900, margin: '0 auto' }}>
        {/* Back Link */}
        <button
          onClick={() => navigate('/faculty')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'none',
            border: 'none',
            color: 'var(--dark)',
            fontWeight: 600,
            fontSize: 12.5,
            cursor: 'pointer',
            alignSelf: 'flex-start'
          }}
        >
          <ArrowLeft size={14} />
          <span>Back to Faculty Directory</span>
        </button>

        {/* Card Form Container */}
        <div className="cbm-card" style={{ padding: '14px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 6,
                backgroundColor: 'var(--gold-subtle)',
                border: '1px solid var(--gold-border)',
                color: 'var(--gold-text)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <UserPlus size={16} />
            </div>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-heading)', margin: 0 }}>Add New Faculty Member</h2>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '1px 0 0 0' }}>
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
