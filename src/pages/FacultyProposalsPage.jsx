import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FacultyLayout } from '../components/layout/FacultyLayout';
import { useAuth } from '../context/AuthContext';
import { useBudget } from '../context/BudgetContext';
import { Badge } from '../components/common/Badge';
import { TableSkeleton } from '../components/common/Skeleton';
import { Plus, Eye, Search } from 'lucide-react';

export const FacultyProposalsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getFacultyMetrics, loading } = useBudget();

  const metrics = getFacultyMetrics(user?.email);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProposal, setSelectedProposal] = useState(null);

  const filteredProposals = metrics.proposals.filter((p) => {
    const term = searchTerm.toLowerCase();
    return (
      p.id.toLowerCase().includes(term) ||
      p.title.toLowerCase().includes(term) ||
      p.category.toLowerCase().includes(term) ||
      p.status.toLowerCase().includes(term)
    );
  });

  return (
    <FacultyLayout pageTitle="My Proposals">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Header & New Button */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-heading)' }}>My Budget Proposals</h1>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
              Track the evaluation and approval status of your CSE department budget requests.
            </p>
          </div>

          <button
            onClick={() => navigate('/faculty/proposal/new')}
            className="cbm-btn cbm-btn-primary"
            style={{ height: 38 }}
          >
            <Plus size={16} />
            <span>New Proposal</span>
          </button>
        </div>

        <hr className="cbm-divider" />

        {/* Proposals Section */}
        <section className="cbm-section">
          <div className="cbm-section-header">
            <div>
              <h2 className="cbm-section-title">Submitted Proposals Register</h2>
              <p className="cbm-section-subtitle">
                History and live tracking of department proposals submitted under your faculty account
              </p>
            </div>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-muted)' }}>
              {filteredProposals.length} Proposals Recorded
            </div>
          </div>

          {/* Search bar */}
          <div style={{ marginBottom: 16, maxWidth: 320, width: '100%', position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
            <input
              type="text"
              placeholder="Search proposal ID, title, status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="cbm-input"
              style={{ height: 36, paddingLeft: 32, fontSize: 12.5 }}
            />
          </div>

          <div className="cbm-table-container">
            <table className="cbm-table">
              <thead>
                <tr>
                  <th>Proposal ID</th>
                  <th>Academic Year</th>
                  <th>Proposal Date</th>
                  <th>Category</th>
                  <th>Program Title</th>
                  <th>Program Date</th>
                  <th style={{ textAlign: 'right' }}>Proposed Amount</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              {loading ? (
                <TableSkeleton rows={4} />
              ) : (
                <tbody>
                  {filteredProposals.length === 0 ? (
                    <tr>
                      <td colSpan={9} style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--text-muted)' }}>
                        <p style={{ fontSize: 13.5, fontWeight: 500, marginBottom: 8 }}>No matching proposals found.</p>
                        <button
                          onClick={() => navigate('/faculty/proposal/new')}
                          className="cbm-btn cbm-btn-outline cbm-btn-sm"
                        >
                          Create New Proposal
                        </button>
                      </td>
                    </tr>
                  ) : (
                    filteredProposals.map((prop) => (
                      <tr key={prop.id}>
                        <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{prop.id}</td>
                        <td style={{ fontWeight: 500, color: 'var(--text-body)' }}>
                          <span style={{ padding: '2px 6px', borderRadius: 3, backgroundColor: 'var(--slate-100)', color: 'var(--slate-700)', fontSize: 11.5, fontWeight: 600 }}>
                            {prop.academicYear || '2026-2027'}
                          </span>
                        </td>
                        <td style={{ color: 'var(--text-muted)', fontSize: 12.5 }}>{prop.proposalDate}</td>
                        <td style={{ color: 'var(--text-body)', fontWeight: 500 }}>
                          <div>{prop.category}</div>
                          {prop.subCategory && (
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{prop.subCategory}</div>
                          )}
                        </td>
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
                    ))
                  )}
                </tbody>
              )}
            </table>
          </div>
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
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Proposal Record Details</span>
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
