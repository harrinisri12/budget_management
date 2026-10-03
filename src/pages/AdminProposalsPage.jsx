import React, { useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Badge } from '../components/common/Badge';
import { TableSkeleton } from '../components/common/Skeleton';
import { useBudget } from '../context/BudgetContext';
import { CheckCircle2, XCircle, AlertCircle, Eye, Filter } from 'lucide-react';

export const AdminProposalsPage = () => {
  const { proposals, updateProposalStatus, loading } = useBudget();
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedProposal, setSelectedProposal] = useState(null);

  const filteredProposals = proposals.filter((p) => {
    if (filterStatus === 'All') return true;
    return p.status === filterStatus;
  });

  return (
    <DashboardLayout pageTitle="Proposals">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Page Header */}
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-heading)' }}>Faculty Budget Proposals</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
            Review, evaluate, and record approval decisions for CSE department faculty proposals.
          </p>
        </div>

        <hr className="cbm-divider" />

        {/* Proposals Register Section */}
        <section className="cbm-section">
          <div className="cbm-section-header">
            <div>
              <h2 className="cbm-section-title">Department Budget Proposals Register</h2>
              <p className="cbm-section-subtitle">
                Official register of departmental funding proposals submitted by faculty members
              </p>
            </div>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-muted)' }}>
              Showing {filteredProposals.length} of {proposals.length} records
            </div>
          </div>

          {/* Status Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: 5 }}>
              <Filter size={14} style={{ color: 'var(--slate-500)' }} /> Status:
            </span>
            {['All', 'Pending', 'Under Review', 'Approved', 'Rejected'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 12.5,
                  fontWeight: filterStatus === st ? 600 : 500,
                  backgroundColor: filterStatus === st ? 'var(--primary)' : 'var(--bg-surface)',
                  color: filterStatus === st ? '#FFFFFF' : 'var(--text-body)',
                  border: filterStatus === st ? '1px solid var(--primary)' : '1px solid var(--border)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="cbm-table-container">
            <table className="cbm-table">
              <thead>
                <tr>
                  <th>Proposal ID</th>
                  <th>Academic Year</th>
                  <th>Faculty Member</th>
                  <th>Category</th>
                  <th>Program Title</th>
                  <th>Program Date</th>
                  <th style={{ textAlign: 'right' }}>Proposed Amount</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              {loading ? (
                <TableSkeleton rows={5} />
              ) : (
                <tbody>
                  {filteredProposals.length === 0 ? (
                    <tr>
                      <td colSpan={9} style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--text-muted)' }}>
                        No proposals found matching status filter "{filterStatus}".
                      </td>
                    </tr>
                  ) : (
                    filteredProposals.map((prop) => (
                      <tr key={prop.id}>
                        <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{prop.id}</td>
                        <td>
                          <span style={{ padding: '2px 6px', borderRadius: 3, backgroundColor: 'var(--slate-100)', border: '1px solid var(--border)', color: 'var(--slate-700)', fontSize: 11.5, fontWeight: 600 }}>
                            {prop.academicYear || '2026-2027'}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600, color: 'var(--text-heading)' }}>
                          {prop.facultyName || 'Faculty Member'}
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400 }}>{prop.facultyEmail}</div>
                        </td>
                        <td style={{ color: 'var(--text-body)', fontWeight: 500 }}>
                          <div>{prop.category}</div>
                          {prop.subCategory && (
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{prop.subCategory}</div>
                          )}
                        </td>
                        <td style={{ color: 'var(--text-heading)', fontWeight: 600 }}>{prop.title}</td>
                        <td style={{ color: 'var(--text-muted)', fontSize: 12.5 }}>{prop.programDate}</td>
                        <td style={{ fontWeight: 700, color: 'var(--text-heading)', textAlign: 'right' }}>
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
                            <span>Review</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              )}
            </table>
          </div>
        </section>

        {/* Admin Proposal Review Modal */}
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
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Proposal Evaluation</span>
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
                    <p style={{ fontSize: 13, color: 'var(--text-body)', marginTop: 1 }}>{selectedProposal.proposalDate || selectedProposal.programDate}</p>
                  </div>
                </div>

                <div style={{ paddingBottom: 8, borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Applicant Faculty</span>
                  <p style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-heading)', marginTop: 1 }}>
                    {selectedProposal.facultyName} ({selectedProposal.facultyEmail})
                  </p>
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

                {/* Admin Status Actions */}
                <div style={{ marginTop: 6, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-heading)', display: 'block', marginBottom: 8 }}>
                    Administrative Approval Decision:
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 90px), 1fr))', gap: 8 }}>
                    <button
                      onClick={() => {
                        updateProposalStatus(selectedProposal.id, 'Approved');
                        setSelectedProposal(null);
                      }}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-sm)',
                        fontWeight: 600,
                        fontSize: 12.5,
                        cursor: 'pointer',
                        border: '1px solid var(--success-border)',
                        backgroundColor: 'var(--success-bg)',
                        color: 'var(--success-text)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 4
                      }}
                    >
                      <CheckCircle2 size={13} />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => {
                        updateProposalStatus(selectedProposal.id, 'Under Review');
                        setSelectedProposal(null);
                      }}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--info-bg)',
                        color: 'var(--info-text)',
                        border: '1px solid var(--info-border)',
                        fontWeight: 600,
                        fontSize: 12.5,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 4
                      }}
                    >
                      <AlertCircle size={13} />
                      <span>Under Review</span>
                    </button>
                    <button
                      onClick={() => {
                        updateProposalStatus(selectedProposal.id, 'Rejected');
                        setSelectedProposal(null);
                      }}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--danger-bg)',
                        color: 'var(--danger-text)',
                        border: '1px solid var(--danger-border)',
                        fontWeight: 600,
                        fontSize: 12.5,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 4
                      }}
                    >
                      <XCircle size={13} />
                      <span>Reject</span>
                    </button>
                  </div>
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
                  marginTop: 14,
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
