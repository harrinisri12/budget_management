import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FacultyLayout } from '../components/layout/FacultyLayout';
import { useAuth } from '../context/AuthContext';
import { useBudget } from '../context/BudgetContext';
import { Badge } from '../components/common/Badge';
import { TableSkeleton } from '../components/common/Skeleton';
import { Wallet, FileText, ArrowUpRight, Plus, Eye, Building } from 'lucide-react';

export const FacultyDashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getFacultyMetrics, loading } = useBudget();
  const [selectedProposal, setSelectedProposal] = useState(null);

  const metrics = getFacultyMetrics(user?.email);

  return (
    <FacultyLayout pageTitle="Faculty Dashboard">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Welcome Administrative Header Area */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Building size={16} style={{ color: 'var(--gold)' }} />
              <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--gold-text)', letterSpacing: '0.04em' }}>
                KONGU ENGINEERING COLLEGE • CSE FACULTY PORTAL
              </span>
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-heading)' }}>
              Welcome, {user?.name || 'Faculty Member'}
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
              {user?.designation || 'Faculty Member'} • Manage departmental activity proposals, track available financial quotas, and review administrative approvals.
            </p>
          </div>

          <button
            onClick={() => navigate('/faculty/proposal/new')}
            className="cbm-btn cbm-btn-primary"
            style={{ height: 40 }}
          >
            <Plus size={16} />
            <span>Submit New Proposal</span>
          </button>
        </div>

        {/* SECTION DIVIDER */}
        <hr className="cbm-divider" />

        {/* 1. LARGE SECTION: FINANCIAL QUOTA & BALANCE OVERVIEW */}
        <section className="cbm-section" aria-labelledby="section-faculty-quota">
          <div className="cbm-section-header">
            <div>
              <h2 id="section-faculty-quota" className="cbm-section-title">
                Financial Quota & Activity Summary
              </h2>
              <p className="cbm-section-subtitle">
                Individual faculty activity allocation and proposal expenditure breakdown for Academic Year 2026-27
              </p>
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--gold-text)', backgroundColor: 'var(--gold-subtle)', padding: '3px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--gold-border)' }}>
              AY 2026-27 Quota
            </span>
          </div>

          {/* Unified Horizontal Metric Strip */}
          <div className="cbm-metric-strip">
            {/* Metric 1: Annual Quota Allocation */}
            <div className="cbm-metric-item cbm-metric-item-highlight">
              <div className="cbm-metric-header">
                <span className="cbm-metric-label">Annual Quota Allocation</span>
                <div className="cbm-metric-icon cbm-metric-icon-gold">
                  <Wallet size={16} />
                </div>
              </div>
              <div>
                <div className="cbm-metric-value">₹{metrics.availableBalance.toLocaleString('en-IN')}</div>
                <div className="cbm-metric-supporting">Faculty Activity Financial Quota</div>
              </div>
            </div>

            {/* Metric 2: Total Proposed */}
            <div className="cbm-metric-item">
              <div className="cbm-metric-header">
                <span className="cbm-metric-label">Total Proposed</span>
                <div className="cbm-metric-icon">
                  <FileText size={16} />
                </div>
              </div>
              <div>
                <div className="cbm-metric-value">₹{metrics.totalProposed.toLocaleString('en-IN')}</div>
                <div className="cbm-metric-supporting">Sum of your submitted proposals</div>
              </div>
            </div>

            {/* Metric 3: Remaining Quota */}
            <div className="cbm-metric-item">
              <div className="cbm-metric-header">
                <span className="cbm-metric-label">Remaining Quota</span>
                <div className="cbm-metric-icon">
                  <ArrowUpRight size={16} />
                </div>
              </div>
              <div>
                <div className="cbm-metric-value">₹{metrics.remainingBalance.toLocaleString('en-IN')}</div>
                <div className="cbm-metric-supporting">Available quota for future programs</div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION DIVIDER */}
        <hr className="cbm-divider" />

        {/* 2. LARGE SECTION: MY SUBMITTED PROPOSALS */}
        <section className="cbm-section" aria-labelledby="section-faculty-proposals">
          <div className="cbm-section-header">
            <div>
              <h2 id="section-faculty-proposals" className="cbm-section-title">
                My Submitted Proposals
              </h2>
              <p className="cbm-section-subtitle">
                Activity proposals submitted for departmental evaluation & approval
              </p>
            </div>
            <button
              onClick={() => navigate('/faculty/proposals')}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-heading)',
                border: '1px solid var(--border)',
                fontWeight: 600,
                fontSize: 12.5,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-page)';
                e.currentTarget.style.borderColor = 'var(--gold-border)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
                e.currentTarget.style.borderColor = 'var(--border)';
              }}
            >
              <span>View All Proposals ({metrics.proposals.length})</span>
              <ArrowUpRight size={13} style={{ color: 'var(--gold)' }} />
            </button>
          </div>

          {loading ? (
            <div className="cbm-table-container">
              <table className="cbm-table">
                <thead>
                  <tr>
                    <th>Proposal ID</th>
                    <th>Date</th>
                    <th>Category</th>
                    <th>Program Title</th>
                    <th>Program Date</th>
                    <th style={{ textAlign: 'right' }}>Proposed Amount</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <TableSkeleton rows={3} />
              </table>
            </div>
          ) : metrics.proposals.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 10 }}>No proposals submitted yet.</p>
              <button
                onClick={() => navigate('/faculty/proposal/new')}
                className="cbm-btn cbm-btn-primary cbm-btn-sm"
              >
                <Plus size={14} />
                <span>Create Your First Proposal</span>
              </button>
            </div>
          ) : (
            <div className="cbm-table-container">
              <table className="cbm-table">
                <thead>
                  <tr>
                    <th>Proposal ID</th>
                    <th>Date</th>
                    <th>Category</th>
                    <th>Program Title</th>
                    <th>Program Date</th>
                    <th style={{ textAlign: 'right' }}>Proposed Amount</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.proposals.slice(0, 5).map((prop) => (
                    <tr key={prop.id}>
                      <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{prop.id}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 12.5 }}>{prop.proposalDate}</td>
                      <td style={{ color: 'var(--text-body)', fontWeight: 500 }}>{prop.category}</td>
                      <td style={{ color: 'var(--text-heading)', fontWeight: 600 }}>{prop.title}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 12.5 }}>{prop.programDate}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--text-heading)' }}>
                        ₹{Number(prop.amount).toLocaleString('en-IN')}
                      </td>
                      <td>
                        <Badge status={prop.status} />
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          onClick={() => setSelectedProposal(prop)}
                          style={{
                            padding: '4px 10px',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: 'var(--bg-surface)',
                            color: 'var(--text-body)',
                            border: '1px solid var(--border)',
                            fontWeight: 600,
                            fontSize: 12,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            cursor: 'pointer'
                          }}
                        >
                          <Eye size={12} />
                          <span>Details</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Details Modal */}
        {selectedProposal && (
          <div
            onClick={() => setSelectedProposal(null)}
            className="cbm-modal-backdrop"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="cbm-modal-content"
              style={{ maxWidth: 540 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Proposal Record</span>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-heading)', marginTop: 2 }}>{selectedProposal.id}</h2>
                </div>
                <Badge status={selectedProposal.status} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: 12, paddingBottom: 8, borderBottom: '1px solid var(--border-subtle)' }}>
                  <div>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Academic Year</span>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-heading)', marginTop: 1 }}>{selectedProposal.academicYear || '2026-2027'}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Proposal Date</span>
                    <p style={{ fontSize: 13, color: 'var(--text-body)', marginTop: 1 }}>{selectedProposal.proposalDate}</p>
                  </div>
                </div>

                <div style={{ paddingBottom: 8, borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Program Title</span>
                  <p style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-heading)', marginTop: 1 }}>{selectedProposal.title}</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: 12, paddingBottom: 8, borderBottom: '1px solid var(--border-subtle)' }}>
                  <div>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Category</span>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-body)', marginTop: 1 }}>
                      {selectedProposal.category} {selectedProposal.subCategory ? `— ${selectedProposal.subCategory}` : ''}
                    </p>
                  </div>
                  <div>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Program Date</span>
                    <p style={{ fontSize: 13, color: 'var(--text-body)', marginTop: 1 }}>{selectedProposal.programDate}</p>
                  </div>
                </div>

                <div style={{ paddingBottom: 8, borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Guest Details</span>
                  <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 1 }}>{selectedProposal.guestDetails || 'None specified'}</p>
                </div>

                <div>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Proposed Amount</span>
                  <p style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-heading)', marginTop: 1 }}>
                    ₹{Number(selectedProposal.amount).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedProposal(null)}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-surface)',
                  color: 'var(--text-body)',
                  border: '1px solid var(--border)',
                  fontWeight: 600,
                  fontSize: 12.5,
                  marginTop: 16,
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </FacultyLayout>
  );
};
