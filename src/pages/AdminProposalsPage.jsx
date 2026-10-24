import React, { useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Badge } from '../components/common/Badge';
import { TableSkeleton } from '../components/common/Skeleton';
import { useAuth } from '../context/AuthContext';
import { useBudget } from '../context/BudgetContext';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  Filter,
  CreditCard,
  Clock,
  Check,
  Receipt,
  AlertTriangle
} from 'lucide-react';

export const AdminProposalsPage = () => {
  const { isAdmin } = useAuth();
  const {
    proposals,
    acceptProposal,
    rejectProposal,
    settleProposal,
    loading
  } = useBudget();

  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [adminRemarks, setAdminRemarks] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Settlement Modal State
  const [settlingProposal, setSettlingProposal] = useState(null);
  const [settlementAmountInput, setSettlementAmountInput] = useState('');
  const [settlementRemarksInput, setSettlementRemarksInput] = useState('');
  const [settleSubmitting, setSettleSubmitting] = useState(false);
  const [settleError, setSettleError] = useState('');

  const handleOpenReview = (prop) => {
    setSelectedProposal(prop);
    setAdminRemarks(prop.adminRemarks || '');
  };

  const handleOpenSettlement = (prop) => {
    setSettlingProposal(prop);
    setSettlementAmountInput(
      prop.settlementAmount !== null && prop.settlementAmount !== undefined
        ? String(prop.settlementAmount)
        : String(prop.amount || '')
    );
    setSettlementRemarksInput(prop.settlementRemarks || '');
    setSettleError('');
  };

  const handleAccept = async (prop) => {
    if (!isAdmin) return;
    const propId = prop.dbId || prop.id;
    setActionLoadingId(propId);
    try {
      await acceptProposal(propId, adminRemarks);
      if (selectedProposal && (selectedProposal.dbId === propId || selectedProposal.id === propId)) {
        setSelectedProposal(null);
      }
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (prop) => {
    if (!isAdmin) return;
    const propId = prop.dbId || prop.id;
    setActionLoadingId(propId);
    try {
      await rejectProposal(propId, adminRemarks);
      if (selectedProposal && (selectedProposal.dbId === propId || selectedProposal.id === propId)) {
        setSelectedProposal(null);
      }
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleFinalizeSettlement = async (e) => {
    e.preventDefault();
    if (!isAdmin || !settlingProposal) return;

    const parsed = Number(settlementAmountInput);
    if (isNaN(parsed) || parsed < 0) {
      setSettleError('Please enter a valid non-negative settlement amount.');
      return;
    }

    setSettleSubmitting(true);
    setSettleError('');
    try {
      const res = await settleProposal(settlingProposal.dbId || settlingProposal.id, {
        settlementAmount: parsed,
        remarks: settlementRemarksInput
      });

      if (res?.success) {
        setSettlingProposal(null);
        if (selectedProposal && (selectedProposal.dbId === settlingProposal.dbId || selectedProposal.id === settlingProposal.id)) {
          setSelectedProposal(null);
        }
      } else if (res?.error) {
        setSettleError(res.error);
      }
    } catch (err) {
      setSettleError(err.message || 'Error processing settlement.');
    } finally {
      setSettleSubmitting(false);
    }
  };

  // Filter proposals
  const filteredProposals = proposals.filter((p) => {
    if (filterStatus === 'All') return true;

    const normStatus = (p.status || '').toLowerCase();
    const isSettled = p.settlementStatus === 'settled' || p.settlement_status === 'settled';

    if (filterStatus === 'Pending') {
      return normStatus === 'pending' || normStatus === 'under review';
    }
    if (filterStatus === 'Accepted') {
      return (normStatus === 'accepted' || normStatus === 'approved') && !isSettled;
    }
    if (filterStatus === 'Settled') {
      return isSettled;
    }
    if (filterStatus === 'Rejected') {
      return normStatus === 'rejected';
    }
    return p.status === filterStatus;
  });

  // Calculate settlement variance preview
  const prevDeductionForSettling = settlingProposal
    ? (settlingProposal.settlementStatus === 'settled' && settlingProposal.settlementAmount !== null
        ? Number(settlingProposal.settlementAmount)
        : Number(settlingProposal.approvedAmount ?? settlingProposal.amount ?? 0))
    : 0;
  const currentSettlementInputVal = Number(settlementAmountInput || 0);
  const settlementDiff = !isNaN(currentSettlementInputVal)
    ? currentSettlementInputVal - prevDeductionForSettling
    : 0;

  return (
    <DashboardLayout pageTitle="Proposals">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Page Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-heading)' }}>Faculty Budget Proposals</h1>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
              {isAdmin
                ? 'Review, accept, reject, and finalize post-activity settlements for department funding proposals.'
                : 'Review department funding proposals submitted by faculty members.'}
            </p>
          </div>
          {!isAdmin && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--slate-100)', border: '1px solid var(--border)', fontSize: 12, color: 'var(--slate-700)', fontWeight: 600 }}>
              <AlertCircle size={14} />
              <span>Read-only evaluation mode (Admin authorization required for Accept/Reject)</span>
            </div>
          )}
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
              <Filter size={14} style={{ color: 'var(--slate-500)' }} /> Filter:
            </span>
            {['All', 'Pending', 'Accepted', 'Settled', 'Rejected'].map((st) => (
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
                  <th style={{ textAlign: 'right' }}>Settlement</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'center', minWidth: 160 }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <TableSkeleton rows={5} columns={10} />
                ) : filteredProposals.length === 0 ? (
                  <tr>
                    <td colSpan={10} style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--text-muted)' }}>
                      No proposals found matching status filter "{filterStatus}".
                    </td>
                  </tr>
                ) : (
                  filteredProposals.map((prop) => {
                    const normStatus = (prop.status || '').toLowerCase();
                    const isAwaitingApproval = normStatus === 'pending' || normStatus === 'under review';
                    const isAccepted = normStatus === 'accepted' || normStatus === 'approved';
                    const isRejected = normStatus === 'rejected';
                    const isSettled = prop.settlementStatus === 'settled';
                    const propId = prop.dbId || prop.id;
                    const isRowBusy = actionLoadingId === propId;

                    return (
                      <tr key={propId}>
                        <td style={{ fontWeight: 600, color: 'var(--primary)' }}>
                          {prop.proposalNumber || prop.proposalId || prop.id}
                        </td>
                        <td>
                          <span style={{ padding: '2px 6px', borderRadius: 3, backgroundColor: 'var(--slate-100)', border: '1px solid var(--border)', color: 'var(--slate-700)', fontSize: 11.5, fontWeight: 600 }}>
                            {prop.academicYear || '—'}
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
                        <td style={{ textAlign: 'right' }}>
                          {isSettled ? (
                            <div>
                              <span style={{ fontWeight: 700, color: '#0369A1' }}>
                                ₹{Number(prop.settlementAmount).toLocaleString('en-IN')}
                              </span>
                              {prop.settlementAmount !== prop.amount && (
                                <div style={{ fontSize: 10.5, color: prop.settlementAmount < prop.amount ? 'var(--success-text)' : 'var(--danger-text)', fontWeight: 600 }}>
                                  {prop.settlementAmount < prop.amount
                                    ? `-₹${(prop.amount - prop.settlementAmount).toLocaleString('en-IN')}`
                                    : `+₹${(prop.settlementAmount - prop.amount).toLocaleString('en-IN')}`}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <Badge status={prop.status} />
                            {isSettled && (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10.5, fontWeight: 700, color: '#0369A1', backgroundColor: '#E0F2FE', padding: '1px 6px', borderRadius: 3, width: 'fit-content' }}>
                                <Check size={11} /> Settled
                              </span>
                            )}
                            {isRejected && prop.rejectedAt && (
                              <span style={{ fontSize: 10, color: 'var(--danger-text)', display: 'inline-flex', alignItems: 'center', gap: 2 }} title={`Rejected on ${new Date(prop.rejectedAt).toLocaleString('en-IN')}. Automatically purged after 24h.`}>
                                <Clock size={10} /> 24h retention
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
                            {/* Admin-only Accept and Reject action buttons for proposals awaiting approval */}
                            {isAwaitingApproval && isAdmin && (
                              <>
                                <button
                                  onClick={() => handleAccept(prop)}
                                  disabled={isRowBusy}
                                  title="Accept proposal and deduct proposed amount from budget"
                                  style={{
                                    padding: '4px 8px',
                                    borderRadius: 'var(--radius-sm)',
                                    backgroundColor: 'var(--success-bg)',
                                    color: 'var(--success-text)',
                                    border: '1px solid var(--success-border)',
                                    fontWeight: 700,
                                    fontSize: 11.5,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 3,
                                    cursor: isRowBusy ? 'not-allowed' : 'pointer',
                                    opacity: isRowBusy ? 0.6 : 1
                                  }}
                                >
                                  <CheckCircle2 size={12} />
                                  <span>Accept</span>
                                </button>
                                <button
                                  onClick={() => handleReject(prop)}
                                  disabled={isRowBusy}
                                  title="Reject proposal (purged automatically after 24h)"
                                  style={{
                                    padding: '4px 8px',
                                    borderRadius: 'var(--radius-sm)',
                                    backgroundColor: 'var(--danger-bg)',
                                    color: 'var(--danger-text)',
                                    border: '1px solid var(--danger-border)',
                                    fontWeight: 700,
                                    fontSize: 11.5,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 3,
                                    cursor: isRowBusy ? 'not-allowed' : 'pointer',
                                    opacity: isRowBusy ? 0.6 : 1
                                  }}
                                >
                                  <XCircle size={12} />
                                  <span>Reject</span>
                                </button>
                              </>
                            )}

                            {/* Settle Action Button for accepted proposals */}
                            {isAccepted && isAdmin && (
                              <button
                                onClick={() => handleOpenSettlement(prop)}
                                style={{
                                  padding: '4px 8px',
                                  borderRadius: 'var(--radius-sm)',
                                  backgroundColor: isSettled ? 'var(--bg-surface)' : '#F0F9FF',
                                  color: isSettled ? 'var(--text-body)' : '#0369A1',
                                  border: isSettled ? '1px solid var(--border)' : '1px solid #BAE6FD',
                                  fontWeight: 600,
                                  fontSize: 11.5,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 3,
                                  cursor: 'pointer'
                                }}
                                title={isSettled ? 'Edit finalized settlement amount' : 'Record actual settlement expense'}
                              >
                                <Receipt size={12} />
                                <span>{isSettled ? 'Edit Settlement' : 'Settle'}</span>
                              </button>
                            )}

                            {/* View / Review Details Button */}
                            <button
                              onClick={() => handleOpenReview(prop)}
                              style={{
                                padding: '4px 8px',
                                borderRadius: 'var(--radius-sm)',
                                backgroundColor: 'var(--bg-surface)',
                                color: 'var(--text-body)',
                                border: '1px solid var(--border)',
                                fontWeight: 600,
                                fontSize: 11.5,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 3,
                                cursor: 'pointer'
                              }}
                            >
                              <Eye size={12} />
                              <span>Details</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* ---------------------------------------------------------------------- */}
        {/* PROPOSAL DETAILS & REVIEW MODAL */}
        {/* ---------------------------------------------------------------------- */}
        {selectedProposal && (
          <div
            onClick={() => setSelectedProposal(null)}
            className="cbm-modal-backdrop"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="cbm-modal-content"
              style={{ maxWidth: 560 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Proposal Evaluation & Details
                  </span>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-heading)', marginTop: 2 }}>
                    {selectedProposal.proposalNumber || selectedProposal.proposalId || selectedProposal.id}
                  </h2>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Badge status={selectedProposal.status} />
                  {selectedProposal.settlementStatus === 'settled' && (
                    <Badge status="Settled" text="Settled" />
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: 12, paddingBottom: 8, borderBottom: '1px solid var(--border-subtle)' }}>
                  <div>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Academic Year</span>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-heading)', marginTop: 1 }}>{selectedProposal.academicYear || '—'}</p>
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

                {/* Proposed vs Settlement Amount Comparison */}
                <div style={{ display: 'grid', gridTemplateColumns: selectedProposal.settlementStatus === 'settled' ? '1fr 1fr' : '1fr', gap: 12, backgroundColor: 'var(--slate-50)', padding: 12, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                  <div>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                      Original Proposed Amount
                    </span>
                    <p style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-heading)', marginTop: 2 }}>
                      ₹{Number(selectedProposal.amount).toLocaleString('en-IN')}
                    </p>
                    <span style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>
                      Preserved for fiscal audit trail
                    </span>
                  </div>

                  {selectedProposal.settlementStatus === 'settled' && (
                    <div>
                      <span style={{ fontSize: 11, color: '#0369A1', textTransform: 'uppercase', fontWeight: 700 }}>
                        Finalized Settlement
                      </span>
                      <p style={{ fontSize: 18, fontWeight: 800, color: '#0369A1', marginTop: 2 }}>
                        ₹{Number(selectedProposal.settlementAmount).toLocaleString('en-IN')}
                      </p>
                      <span style={{ fontSize: 10.5, color: selectedProposal.settlementAmount <= selectedProposal.amount ? 'var(--success-text)' : 'var(--danger-text)', fontWeight: 600 }}>
                        {selectedProposal.settlementAmount < selectedProposal.amount
                          ? `₹${(selectedProposal.amount - selectedProposal.settlementAmount).toLocaleString('en-IN')} credited back to budget`
                          : selectedProposal.settlementAmount > selectedProposal.amount
                            ? `₹${(selectedProposal.settlementAmount - selectedProposal.amount).toLocaleString('en-IN')} additional deducted`
                            : 'Exact proposed match'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Rejection Notice & Retention Timer */}
                {(selectedProposal.status || '').toLowerCase() === 'rejected' && (
                  <div style={{ padding: 10, backgroundColor: 'var(--danger-bg)', border: '1px solid var(--danger-border)', borderRadius: 'var(--radius-sm)', color: 'var(--danger-text)', fontSize: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}>
                      <AlertTriangle size={14} />
                      <span>Rejected Proposal — 24-Hour Retention Policy</span>
                    </div>
                    <p style={{ marginTop: 4, fontSize: 11.5 }}>
                      This proposal was rejected on {selectedProposal.rejectedAt ? new Date(selectedProposal.rejectedAt).toLocaleString('en-IN') : 'recently'}. Per retention rules, it will be automatically and permanently purged 24 hours after rejection by the server.
                    </p>
                  </div>
                )}

                {/* Admin Remarks Input for pending proposals */}
                {isAdmin && ['pending', 'under review'].includes((selectedProposal.status || '').toLowerCase()) && (
                  <div style={{ paddingTop: 8, borderTop: '1px solid var(--border-subtle)' }}>
                    <label className="cbm-label" htmlFor="admin-remarks-input">
                      Administrative Decision Remarks (Optional)
                    </label>
                    <textarea
                      id="admin-remarks-input"
                      rows={2}
                      className="cbm-input"
                      placeholder="Enter approval comments, stipulations, or reasons for rejection..."
                      value={adminRemarks}
                      onChange={(e) => setAdminRemarks(e.target.value)}
                      style={{ height: 'auto', padding: '8px 10px', fontSize: 12.5 }}
                    />
                  </div>
                )}

                {/* Existing remarks if any */}
                {selectedProposal.adminRemarks && (
                  <div style={{ padding: 10, backgroundColor: 'var(--slate-50)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Administrator Remarks:</span>
                    <p style={{ fontSize: 12.5, color: 'var(--text-body)', marginTop: 2 }}>{selectedProposal.adminRemarks}</p>
                  </div>
                )}

                {/* Admin Status Actions */}
                {isAdmin && ['pending', 'under review'].includes((selectedProposal.status || '').toLowerCase()) && (
                  <div style={{ marginTop: 6, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-heading)', display: 'block', marginBottom: 8 }}>
                      Administrative Decision Actions:
                    </span>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <button
                        onClick={() => handleAccept(selectedProposal)}
                        disabled={actionLoadingId === (selectedProposal.dbId || selectedProposal.id)}
                        style={{
                          padding: '9px 12px',
                          borderRadius: 'var(--radius-sm)',
                          fontWeight: 700,
                          fontSize: 13,
                          cursor: 'pointer',
                          border: '1px solid var(--success-border)',
                          backgroundColor: 'var(--success-bg)',
                          color: 'var(--success-text)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6
                        }}
                      >
                        <CheckCircle2 size={15} />
                        <span>Accept Proposal</span>
                      </button>

                      <button
                        onClick={() => handleReject(selectedProposal)}
                        disabled={actionLoadingId === (selectedProposal.dbId || selectedProposal.id)}
                        style={{
                          padding: '9px 12px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--danger-bg)',
                          color: 'var(--danger-text)',
                          border: '1px solid var(--danger-border)',
                          fontWeight: 700,
                          fontSize: 13,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6
                        }}
                      >
                        <XCircle size={15} />
                        <span>Reject Proposal</span>
                      </button>
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginTop: 6, textAlign: 'center' }}>
                      Accept immediately deducts ₹{Number(selectedProposal.amount).toLocaleString('en-IN')} from available budget.
                    </span>
                  </div>
                )}

                {/* Option to Settle if accepted */}
                {isAdmin && ['accepted', 'approved'].includes((selectedProposal.status || '').toLowerCase()) && (
                  <div style={{ marginTop: 6, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                    <button
                      onClick={() => {
                        handleOpenSettlement(selectedProposal);
                      }}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: 'var(--radius-sm)',
                        fontWeight: 700,
                        fontSize: 13,
                        cursor: 'pointer',
                        border: '1px solid #BAE6FD',
                        backgroundColor: '#F0F9FF',
                        color: '#0369A1',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6
                      }}
                    >
                      <Receipt size={15} />
                      <span>{selectedProposal.settlementStatus === 'settled' ? 'Update Finalized Settlement' : 'Finalize Settlement Amount'}</span>
                    </button>
                  </div>
                )}
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

        {/* ---------------------------------------------------------------------- */}
        {/* SETTLEMENT MODAL (REPLACES PROVISIONAL PROPOSED DEDUCTION) */}
        {/* ---------------------------------------------------------------------- */}
        {settlingProposal && (
          <div
            onClick={() => setSettlingProposal(null)}
            className="cbm-modal-backdrop"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="cbm-modal-content"
              style={{ maxWidth: 520 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--gold-text)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Activity Financial Settlement
                  </span>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-heading)', marginTop: 2 }}>
                    {settlingProposal.proposalNumber || settlingProposal.proposalId}
                  </h2>
                </div>
                <Badge status={settlingProposal.status} />
              </div>

              <form onSubmit={handleFinalizeSettlement} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Summary Box */}
                <div style={{ backgroundColor: 'var(--slate-50)', padding: 12, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-heading)' }}>
                    {settlingProposal.title}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                    Category: <strong>{settlingProposal.category}</strong> • Academic Year: <strong>{settlingProposal.academicYear}</strong>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border-subtle)' }}>
                    <div>
                      <span style={{ fontSize: 10.5, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Original Proposed Amount</span>
                      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-heading)' }}>
                        ₹{Number(settlingProposal.amount).toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: 10.5, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Currently Deducted</span>
                      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--gold-text)' }}>
                        ₹{prevDeductionForSettling.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Settlement Amount Input */}
                <div>
                  <label className="cbm-label" htmlFor="settlement-amount-field" style={{ fontWeight: 700 }}>
                    Actual Settlement Amount (INR) *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: 'var(--slate-400)' }}>
                      ₹
                    </span>
                    <input
                      id="settlement-amount-field"
                      type="number"
                      min="0"
                      step="any"
                      required
                      placeholder="0.00"
                      value={settlementAmountInput}
                      onChange={(e) => setSettlementAmountInput(e.target.value)}
                      className="cbm-input"
                      style={{ paddingLeft: 28, fontSize: 15, fontWeight: 700 }}
                    />
                  </div>
                  <span style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                    This actual settlement replaces the provisional ₹{prevDeductionForSettling.toLocaleString('en-IN')} deduction.
                  </span>
                </div>

                {/* Dynamic Difference Preview Banner */}
                {!isNaN(currentSettlementInputVal) && currentSettlementInputVal >= 0 && (
                  <div
                    style={{
                      padding: 10,
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: settlementDiff < 0 ? 'var(--success-bg)' : settlementDiff > 0 ? '#FFFBEB' : 'var(--slate-100)',
                      border: settlementDiff < 0 ? '1px solid var(--success-border)' : settlementDiff > 0 ? '1px solid #FDE68A' : '1px solid var(--border)',
                      fontSize: 12,
                      color: settlementDiff < 0 ? 'var(--success-text)' : settlementDiff > 0 ? '#92400E' : 'var(--slate-700)'
                    }}
                  >
                    <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <CreditCard size={14} />
                      <span>Budget Adjustment Preview:</span>
                    </div>
                    <div style={{ marginTop: 4 }}>
                      {settlementDiff < 0 ? (
                        <span>
                          <strong>₹{Math.abs(settlementDiff).toLocaleString('en-IN')}</strong> will be <strong>credited back</strong> to the category and annual available budget.
                        </span>
                      ) : settlementDiff > 0 ? (
                        <span>
                          An additional <strong>₹{settlementDiff.toLocaleString('en-IN')}</strong> will be deducted from the available budget.
                        </span>
                      ) : (
                        <span>Settlement amount exactly equals the previously deducted amount. No net change to budget balance.</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Remarks Input */}
                <div>
                  <label className="cbm-label" htmlFor="settlement-remarks-field">
                    Settlement Notes & Invoice / Voucher References (Optional)
                  </label>
                  <textarea
                    id="settlement-remarks-field"
                    rows={2}
                    className="cbm-input"
                    placeholder="Enter voucher numbers, vendor bills, audit notes, or refund justifications..."
                    value={settlementRemarksInput}
                    onChange={(e) => setSettlementRemarksInput(e.target.value)}
                    style={{ height: 'auto', padding: '8px 10px', fontSize: 12.5 }}
                  />
                </div>

                {/* Error Banner */}
                {settleError && (
                  <div style={{ padding: 10, backgroundColor: 'var(--danger-bg)', border: '1px solid var(--danger-border)', borderRadius: 'var(--radius-sm)', color: 'var(--danger-text)', fontSize: 12.5 }}>
                    {settleError}
                  </div>
                )}

                {/* Modal Actions */}
                <div style={{ display: 'flex', gap: 10, marginTop: 6, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                  <button
                    type="button"
                    onClick={() => setSettlingProposal(null)}
                    style={{
                      flex: 1,
                      padding: '9px 12px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-surface)',
                      color: 'var(--text-body)',
                      border: '1px solid var(--border)',
                      fontWeight: 600,
                      fontSize: 13,
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={settleSubmitting}
                    style={{
                      flex: 2,
                      padding: '9px 12px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--primary)',
                      color: '#FFFFFF',
                      border: 'none',
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: settleSubmitting ? 'not-allowed' : 'pointer',
                      opacity: settleSubmitting ? 0.7 : 1,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6
                    }}
                  >
                    <Check size={15} />
                    <span>{settleSubmitting ? 'Processing Settlement...' : 'Finalize Settlement'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
