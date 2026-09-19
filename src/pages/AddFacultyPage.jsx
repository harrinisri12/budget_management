import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { AddFacultyForm } from '../components/faculty/AddFacultyForm';
import { ArrowLeft, UserPlus } from 'lucide-react';

export const AddFacultyPage = () => {
  const navigate = useNavigate();

  return (
    <DashboardLayout pageTitle="Add Faculty">
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
            color: 'var(--primary)',
            fontWeight: 600,
            fontSize: 14,
            cursor: 'pointer',
            alignSelf: 'flex-start'
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Faculty Roster</span>
        </button>

        {/* Card Form Container */}
        <div className="cbm-card" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28, paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: 12,
                backgroundColor: '#F1EFFD',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <UserPlus size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--dark)' }}>Add New Faculty</h2>
              <p style={{ fontSize: 13, color: 'var(--dark-muted)' }}>
                Register a new faculty member into the college departmental database
              </p>
            </div>
          </div>

          <AddFacultyForm onCancel={() => navigate('/faculty')} />
        </div>
      </div>
    </DashboardLayout>
  );
};
