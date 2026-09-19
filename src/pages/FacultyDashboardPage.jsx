import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FacultyLayout } from '../components/layout/FacultyLayout';
import { useAuth } from '../context/AuthContext';
import { useBudget } from '../context/BudgetContext';
import { Wallet, FileText, ArrowUpRight, Plus, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export const FacultyDashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getFacultyMetrics } = useBudget();

  const metrics = getFacultyMetrics(user?.email);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return (
          <span
            style={{
              padding: '5px 12px',
              borderRadius: 20,
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              color: '#10B981',
              fontSize: 12,
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5
            }}
          >
            <CheckCircle2 size={14} /> Approved
          </span>
        );
      case 'Rejected':
        return (
          <span
            style={{
              padding: '5px 12px',
              borderRadius: 20,
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: '#EF4444',
              fontSize: 12,
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5
            }}
          >
            <XCircle size={14} /> Rejected
          </span>
        );
      case 'Under Review':
        return (
          <span
            style={{
              padding: '5px 12px',
              borderRadius: 20,
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              color: '#3B82F6',
              fontSize: 12,
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5
            }}
          >
            <AlertCircle size={14} /> Under Review
          </span>
        );
      default:
        return (
          <span
            style={{
              padding: '5px 12px',
              borderRadius: 20,
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              color: '#F59E0B',
              fontSize: 12,
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5
            }}
          >
            <Clock size={14} /> Pending
          </span>
        );
    }
  };

  return (
    <FacultyLayout pageTitle="Faculty Dashboard">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        {/* Welcome Banner */}
        <div
          style={{
            padding: '28px 32px',
            borderRadius: 20,
            backgroundColor: '#13141D',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 10px 30px rgba(19, 20, 29, 0.15)'
          }}
        >
          <div
            style={{
              position: 'absolute',
              right: -40,
              top: -40,
              width: 240,
              height: 240,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(68, 60, 222, 0.35) 0%, rgba(19, 20, 29, 0) 70%)',
              pointerEvents: 'none'
            }}
          />

          <div style={{ zIndex: 1 }}>
            <span
              style={{
                display: 'inline-block',
                padding: '4px 12px',
                borderRadius: 20,
                backgroundColor: 'rgba(68, 60, 222, 0.3)',
                color: '#ABA7CD',
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '0.04em',
                marginBottom: 10
              }}
            >
              CSE FACULTY PORTAL
            </span>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#FFFFFF', marginBottom: 6 }}>
              Welcome back, {user?.name || 'Faculty Member'}!
            </h1>
            <p style={{ fontSize: 14, color: '#ABA7CD', maxWidth: 540 }}>
              Manage your activity proposals, track available allocations, and submit budget requests for the Computer Science and Engineering Department.
            </p>
          </div>

          <button
            onClick={() => navigate('/faculty/proposal/new')}
            style={{
              zIndex: 1,
              padding: '14px 24px',
              borderRadius: 14,
              backgroundColor: 'var(--primary)',
              color: '#FFFFFF',
              border: 'none',
              fontWeight: 700,
              fontSize: 15,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(68, 60, 222, 0.4)',
              transition: 'transform 0.2s ease'
            }}
          >
            <Plus size={20} />
            <span>New Proposal</span>
          </button>
        </div>

        {/* Financial Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {/* Card 1: Available Balance */}
          <div className="cbm-card" style={{ padding: '24px 28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Available Balance
              </span>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  color: '#10B981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Wallet size={22} />
              </div>
            </div>
            <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--dark)', letterSpacing: '-0.02em', marginBottom: 4 }}>
              ₹{metrics.availableBalance.toLocaleString('en-IN')}
            </div>
            <p style={{ fontSize: 12.5, color: 'var(--dark-muted)' }}>
              CSE Department Faculty Activity Quota
            </p>
          </div>

          {/* Card 2: Total Proposed */}
          <div className="cbm-card" style={{ padding: '24px 28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Total Proposed
              </span>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  backgroundColor: 'rgba(68, 60, 222, 0.1)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <FileText size={22} />
              </div>
            </div>
            <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.02em', marginBottom: 4 }}>
              ₹{metrics.totalProposed.toLocaleString('en-IN')}
            </div>
            <p style={{ fontSize: 12.5, color: 'var(--dark-muted)' }}>
              Sum of all proposals requested by you
            </p>
          </div>

          {/* Card 3: Remaining Balance */}
          <div className="cbm-card" style={{ padding: '24px 28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Remaining Balance
              </span>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  backgroundColor: 'rgba(99, 91, 255, 0.1)',
                  color: '#635BFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <ArrowUpRight size={22} />
              </div>
            </div>
            <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--dark)', letterSpacing: '-0.02em', marginBottom: 4 }}>
              ₹{metrics.remainingBalance.toLocaleString('en-IN')}
            </div>
            <p style={{ fontSize: 12.5, color: 'var(--dark-muted)' }}>
              Available Balance − Total Proposed
            </p>
          </div>
        </div>

        {/* My Proposals Table Section */}
        <div className="cbm-card" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--dark)' }}>My Proposals</h3>
              <p style={{ fontSize: 13, color: 'var(--dark-muted)', marginTop: 2 }}>
                Recent activity proposals submitted for CSE department approval
              </p>
            </div>
            <button
              onClick={() => navigate('/faculty/proposals')}
              style={{
                padding: '8px 16px',
                borderRadius: 10,
                backgroundColor: 'rgba(68, 60, 222, 0.08)',
                color: 'var(--primary)',
                border: 'none',
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer'
              }}
            >
              View All Proposals ({metrics.proposals.length})
            </button>
          </div>

          {metrics.proposals.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--dark-muted)' }}>
              <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>No proposals submitted yet.</p>
              <button
                onClick={() => navigate('/faculty/proposal/new')}
                style={{
                  padding: '10px 20px',
                  borderRadius: 10,
                  backgroundColor: 'var(--primary)',
                  color: '#FFFFFF',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: 'pointer'
                }}
              >
                + Create Your First Proposal
              </button>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 700, color: 'var(--secondary)', textTransform: 'uppercase' }}>Proposal ID</th>
                    <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 700, color: 'var(--secondary)', textTransform: 'uppercase' }}>Date</th>
                    <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 700, color: 'var(--secondary)', textTransform: 'uppercase' }}>Category</th>
                    <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 700, color: 'var(--secondary)', textTransform: 'uppercase' }}>Program Title</th>
                    <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 700, color: 'var(--secondary)', textTransform: 'uppercase' }}>Program Date</th>
                    <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 700, color: 'var(--secondary)', textTransform: 'uppercase' }}>Proposed Amount</th>
                    <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 700, color: 'var(--secondary)', textTransform: 'uppercase' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.proposals.slice(0, 5).map((prop) => (
                    <tr key={prop.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '16px', fontSize: 13.5, fontWeight: 700, color: 'var(--primary)' }}>{prop.id}</td>
                      <td style={{ padding: '16px', fontSize: 13.5, color: 'var(--dark-muted)' }}>{prop.proposalDate}</td>
                      <td style={{ padding: '16px', fontSize: 13.5, color: 'var(--dark)', fontWeight: 600 }}>{prop.category}</td>
                      <td style={{ padding: '16px', fontSize: 13.5, color: 'var(--dark)', fontWeight: 700 }}>{prop.title}</td>
                      <td style={{ padding: '16px', fontSize: 13.5, color: 'var(--dark-muted)' }}>{prop.programDate}</td>
                      <td style={{ padding: '16px', fontSize: 14, fontWeight: 800, color: 'var(--dark)' }}>₹{Number(prop.amount).toLocaleString('en-IN')}</td>
                      <td style={{ padding: '16px' }}>{getStatusBadge(prop.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </FacultyLayout>
  );
};
