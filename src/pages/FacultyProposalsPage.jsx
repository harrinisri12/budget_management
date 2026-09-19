import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FacultyLayout } from '../components/layout/FacultyLayout';
import { useAuth } from '../context/AuthContext';
import { useBudget } from '../context/BudgetContext';
import { Plus, Clock, CheckCircle2, XCircle, AlertCircle, Eye, Search } from 'lucide-react';

export const FacultyProposalsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getFacultyMetrics } = useBudget();

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
    <FacultyLayout pageTitle="My Proposals">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        {/* Header & New Button */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--dark)' }}>My Proposals</h1>
            <p style={{ fontSize: 14, color: 'var(--dark-muted)', marginTop: 4 }}>
              Track the approval status of your CSE department budget requests.
            </p>
          </div>

          <button
            onClick={() => navigate('/faculty/proposal/new')}
            style={{
              padding: '12px 22px',
              borderRadius: 12,
              backgroundColor: 'var(--primary)',
              color: '#FFFFFF',
              border: 'none',
              fontWeight: 700,
              fontSize: 14.5,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(68, 60, 222, 0.3)'
            }}
          >
            <Plus size={18} />
            <span>New Proposal</span>
          </button>
        </div>

        {/* Proposals Container */}
        <div className="cbm-card" style={{ padding: '28px' }}>
          {/* Search bar */}
          <div style={{ marginBottom: 20, maxWidth: 360, position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: 14, top: 13, color: 'var(--secondary)' }} />
            <input
              type="text"
              placeholder="Search proposals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '11px 16px 11px 42px',
                borderRadius: 10,
                border: '1px solid var(--border)',
                backgroundColor: '#FAF9FE',
                fontSize: 14,
                outline: 'none'
              }}
            />
          </div>

          {filteredProposals.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--dark-muted)' }}>
              <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>No matching proposals found.</p>
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
                + Create New Proposal
              </button>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '14px 16px', fontSize: 12, fontWeight: 700, color: 'var(--secondary)', textTransform: 'uppercase' }}>Proposal ID</th>
                    <th style={{ padding: '14px 16px', fontSize: 12, fontWeight: 700, color: 'var(--secondary)', textTransform: 'uppercase' }}>Date</th>
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
                      <td style={{ padding: '16px', fontSize: 13.5, color: 'var(--dark-muted)' }}>{prop.proposalDate}</td>
                      <td style={{ padding: '16px', fontSize: 13.5, color: 'var(--dark)', fontWeight: 600 }}>{prop.category}</td>
                      <td style={{ padding: '16px', fontSize: 13.5, color: 'var(--dark)', fontWeight: 700 }}>{prop.title}</td>
                      <td style={{ padding: '16px', fontSize: 13.5, color: 'var(--dark-muted)' }}>{prop.programDate}</td>
                      <td style={{ padding: '16px', fontSize: 14, fontWeight: 800, color: 'var(--dark)' }}>
                        ₹{Number(prop.amount).toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '16px' }}>{getStatusBadge(prop.status)}</td>
                      <td style={{ padding: '16px' }}>
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
                          <Eye size={14} /> Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Details Modal */}
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
                maxWidth: 560,
                padding: '32px',
                borderRadius: 20,
                backgroundColor: '#FFFFFF',
                boxShadow: '0 20px 50px rgba(0,0,0,0.2)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>Proposal Details</span>
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--dark)', marginTop: 2 }}>{selectedProposal.id}</h2>
                </div>
                {getStatusBadge(selectedProposal.status)}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 11.5, color: 'var(--secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Program Title</span>
                  <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--dark)', marginTop: 2 }}>{selectedProposal.title}</p>
                </div>

                <div style={{ paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 11.5, color: 'var(--secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Category</span>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--dark)', marginTop: 2 }}>{selectedProposal.category}</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <span style={{ fontSize: 11.5, color: 'var(--secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Proposal Date</span>
                    <p style={{ fontSize: 13.5, color: 'var(--dark)', marginTop: 2 }}>{selectedProposal.proposalDate}</p>
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
                  <p style={{ fontSize: 20, fontWeight: 800, color: 'var(--primary)', marginTop: 2 }}>
                    ₹{Number(selectedProposal.amount).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedProposal(null)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: 12,
                  backgroundColor: 'var(--primary)',
                  color: '#FFFFFF',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: 14,
                  marginTop: 24,
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
