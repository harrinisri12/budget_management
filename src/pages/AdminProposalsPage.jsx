import React, { useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useBudget } from '../context/BudgetContext';
import { CheckCircle2, XCircle, AlertCircle, Clock, Eye, Filter } from 'lucide-react';

export const AdminProposalsPage = () => {
  const { proposals, updateProposalStatus } = useBudget();
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedProposal, setSelectedProposal] = useState(null);

  const filteredProposals = proposals.filter((p) => {
    if (filterStatus === 'All') return true;
    return p.status === filterStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return (
          <span
            style={{
              padding: '6px 14px',
              borderRadius: 20,
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              color: '#10B981',
              fontSize: 12.5,
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <CheckCircle2 size={15} /> Approved
          </span>
        );
      case 'Rejected':
        return (
          <span
            style={{
              padding: '6px 14px',
              borderRadius: 20,
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: '#EF4444',
              fontSize: 12.5,
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <XCircle size={15} /> Rejected
          </span>
        );
      case 'Under Review':
        return (
          <span
            style={{
              padding: '6px 14px',
              borderRadius: 20,
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              color: '#3B82F6',
              fontSize: 12.5,
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <AlertCircle size={15} /> Under Review
          </span>
        );
      default:
        return (
          <span
            style={{
              padding: '6px 14px',
              borderRadius: 20,
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              color: '#F59E0B',
              fontSize: 12.5,
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <Clock size={15} /> Pending
          </span>
        );
    }
  };

  return (
    <DashboardLayout pageTitle="Faculty Proposals">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        {/* Header */}
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--dark)' }}>Faculty Budget Proposals</h1>
          <p style={{ fontSize: 14, color: 'var(--dark-muted)', marginTop: 4 }}>
            Review, evaluate, and update approval decisions for CSE department faculty proposals.
          </p>
        </div>

        {/* Proposals List Card */}
        <div className="cbm-card" style={{ padding: '28px' }}>
          {/* Status Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Filter size={16} /> Filter Status:
            </span>
            {['All', 'Pending', 'Under Review', 'Approved', 'Rejected'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                style={{
                  padding: '7px 16px',
                  borderRadius: 20,
                  fontSize: 13,
                  fontWeight: filterStatus === st ? 700 : 600,
                  backgroundColor: filterStatus === st ? 'var(--primary)' : 'rgba(0,0,0,0.04)',
                  color: filterStatus === st ? '#FFFFFF' : 'var(--dark-muted)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {st}
              </button>
            ))}
          </div>

          {filteredProposals.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--dark-muted)' }}>
              No proposals found matching status filter "{filterStatus}".
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '14px 16px', fontSize: 12, fontWeight: 700, color: 'var(--secondary)', textTransform: 'uppercase' }}>Proposal ID</th>
                    <th style={{ padding: '14px 16px', fontSize: 12, fontWeight: 700, color: 'var(--secondary)', textTransform: 'uppercase' }}>Faculty</th>
                    <th style={{ padding: '14px 16px', fontSize: 12, fontWeight: 700, color: 'var(--secondary)', textTransform: 'uppercase' }}>Category</th>
                    <th style={{ padding: '14px 16px', fontSize: 12, fontWeight: 700, color: 'var(--secondary)', textTransform: 'uppercase' }}>Program Title</th>
                    <th style={{ padding: '14px 16px', fontSize: 12, fontWeight: 700, color: 'var(--secondary)', textTransform: 'uppercase' }}>Program Date</th>
                    <th style={{ padding: '14px 16px', fontSize: 12, fontWeight: 700, color: 'var(--secondary)', textTransform: 'uppercase' }}>Proposed Amount</th>
                    <th style={{ padding: '14px 16px', fontSize: 12, fontWeight: 700, color: 'var(--secondary)', textTransform: 'uppercase' }}>Status</th>
                    <th style={{ padding: '14px 16px', fontSize: 12, fontWeight: 700, color: 'var(--secondary)', textTransform: 'uppercase' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProposals.map((prop) => (
                    <tr key={prop.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '16px', fontSize: 13.5, fontWeight: 700, color: 'var(--primary)' }}>{prop.id}</td>
                      <td style={{ padding: '16px', fontSize: 13.5, fontWeight: 700, color: 'var(--dark)' }}>
                        {prop.facultyName || 'Faculty Member'}
                        <div style={{ fontSize: 11, color: 'var(--dark-muted)', fontWeight: 500 }}>{prop.facultyEmail}</div>
                      </td>
                      <td style={{ padding: '16px', fontSize: 13.5, color: 'var(--dark)', fontWeight: 600 }}>{prop.category}</td>
                      <td style={{ padding: '16px', fontSize: 13.5, color: 'var(--dark)', fontWeight: 700 }}>{prop.title}</td>
                      <td style={{ padding: '16px', fontSize: 13.5, color: 'var(--dark-muted)' }}>{prop.programDate}</td>
                      <td style={{ padding: '16px', fontSize: 14, fontWeight: 800, color: 'var(--dark)' }}>
                        ₹{Number(prop.amount).toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '16px' }}>{getStatusBadge(prop.status)}</td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <button
                            onClick={() => setSelectedProposal(prop)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: 8,
                              backgroundColor: 'rgba(68, 60, 222, 0.08)',
                              color: 'var(--primary)',
                              border: 'none',
                              fontWeight: 700,
                              fontSize: 12.5,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5,
                              cursor: 'pointer'
                            }}
                          >
                            <Eye size={14} /> Review
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Admin Proposal Review Modal */}
        {selectedProposal && (
          <div
            onClick={() => setSelectedProposal(null)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(19, 20, 29, 0.5)',
              backdropFilter: 'blur(4px)',
              zIndex: 60,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 24
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="cbm-card"
              style={{
                width: '100%',
                maxWidth: 580,
                padding: '32px',
                borderRadius: 20,
                backgroundColor: '#FFFFFF',
                boxShadow: '0 20px 50px rgba(0,0,0,0.2)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>Admin Proposal Review</span>
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--dark)', marginTop: 2 }}>{selectedProposal.id}</h2>
                </div>
                {getStatusBadge(selectedProposal.status)}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 11.5, color: 'var(--secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Requested By</span>
                  <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--dark)', marginTop: 2 }}>
                    {selectedProposal.facultyName} ({selectedProposal.facultyEmail})
                  </p>
                </div>

                <div style={{ paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 11.5, color: 'var(--secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Program Title</span>
                  <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--dark)', marginTop: 2 }}>{selectedProposal.title}</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <span style={{ fontSize: 11.5, color: 'var(--secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Category</span>
                    <p style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--dark)', marginTop: 2 }}>{selectedProposal.category}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: 11.5, color: 'var(--secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Program Date</span>
                    <p style={{ fontSize: 13.5, color: 'var(--dark)', marginTop: 2 }}>{selectedProposal.programDate}</p>
                  </div>
                </div>

                <div style={{ paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 11.5, color: 'var(--secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Guest Details</span>
                  <p style={{ fontSize: 13.5, color: 'var(--dark-muted)', marginTop: 2 }}>{selectedProposal.guestDetails || 'None'}</p>
                </div>

                <div>
                  <span style={{ fontSize: 11.5, color: 'var(--secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Proposed Amount</span>
                  <p style={{ fontSize: 22, fontWeight: 800, color: 'var(--primary)', marginTop: 2 }}>
                    ₹{Number(selectedProposal.amount).toLocaleString('en-IN')}
                  </p>
                </div>

                {/* Admin Status Actions */}
                <div style={{ marginTop: 12, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--dark)', display: 'block', marginBottom: 10 }}>
                    Update Proposal Status:
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                    <button
                      onClick={() => {
                        updateProposalStatus(selectedProposal.id, 'Approved');
                        setSelectedProposal(null);
                      }}
                      style={{
                        padding: '10px',
                        borderRadius: 10,
                        backgroundColor: '#10B981',
                        color: '#FFFFFF',
                        border: 'none',
                        fontWeight: 700,
                        fontSize: 13,
                        cursor: 'pointer'
                      }}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        updateProposalStatus(selectedProposal.id, 'Under Review');
                        setSelectedProposal(null);
                      }}
                      style={{
                        padding: '10px',
                        borderRadius: 10,
                        backgroundColor: '#3B82F6',
                        color: '#FFFFFF',
                        border: 'none',
                        fontWeight: 700,
                        fontSize: 13,
                        cursor: 'pointer'
                      }}
                    >
                      Under Review
                    </button>
                    <button
                      onClick={() => {
                        updateProposalStatus(selectedProposal.id, 'Rejected');
                        setSelectedProposal(null);
                      }}
                      style={{
                        padding: '10px',
                        borderRadius: 10,
                        backgroundColor: '#EF4444',
                        color: '#FFFFFF',
                        border: 'none',
                        fontWeight: 700,
                        fontSize: 13,
                        cursor: 'pointer'
                      }}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedProposal(null)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: 12,
                  backgroundColor: '#F1EFFD',
                  color: 'var(--dark)',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: 14,
                  marginTop: 18,
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
