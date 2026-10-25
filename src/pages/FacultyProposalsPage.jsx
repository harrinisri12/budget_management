import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FacultyLayout } from '../components/layout/FacultyLayout';
import { useAuth } from '../context/AuthContext';
import { useBudget } from '../context/BudgetContext';
import { Badge } from '../components/common/Badge';
import { TableSkeleton } from '../components/common/Skeleton';
import {
  Plus,
  Eye,
  Search,
  Receipt,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
  X,
  FileText
} from 'lucide-react';

export const FacultyProposalsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getFacultyMetrics, loading, submitFacultySettlement } = useBudget();

  const metrics = getFacultyMetrics(user?.email);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProposal, setSelectedProposal] = useState(null);

  // Settlement Form Modal State
  const [settlementProposal, setSettlementProposal] = useState(null);
  const [settlementDate, setSettlementDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [actualAmountSpent, setActualAmountSpent] = useState('');
  const [settlementRemarks, setSettlementRemarks] = useState('');
  const [isSubmittingSettlement, setIsSubmittingSettlement] = useState(false);
  const [settlementError, setSettlementError] = useState('');

  const proposals = metrics?.proposals || [];

  // Robust check if event has taken place
  const isEventCompleted = (prop) => {
    if (!prop) return false;
    const dateStr = prop.eventDetails?.programmeDetails?.endDate || prop.endDate || prop.programDate;
    if (!dateStr) return false;

    let eventTime = new Date(dateStr).getTime();
    if (isNaN(eventTime)) {
      const parsed = Date.parse(dateStr);
      if (!isNaN(parsed)) eventTime = parsed;
    }
    if (isNaN(eventTime)) return false;

    const endOfToday = new Date().setHours(23, 59, 59, 999);
    return eventTime <= endOfToday;
  };

  const filteredProposals = useMemo(() => {
    return proposals.filter((p) => {
      const term = searchTerm.toLowerCase();
      const idStr = String(p.proposalNumber || p.proposalId || p.id || '').toLowerCase();
      const titleStr = String(p.title || '').toLowerCase();
      const catStr = String(p.category || '').toLowerCase();
      const subCatStr = String(p.subCategory || '').toLowerCase();
      const statusStr = String(p.status || '').toLowerCase();
      const settlementStr = String(p.settlementStatus || '').toLowerCase();

      return (
        idStr.includes(term) ||
        titleStr.includes(term) ||
        catStr.includes(term) ||
        subCatStr.includes(term) ||
        statusStr.includes(term) ||
        settlementStr.includes(term)
      );
    });
  }, [proposals, searchTerm]);

  // Open Settlement Form
  const handleOpenSettlement = (prop) => {
    setSettlementProposal(prop);
    setSettlementDate(new Date().toISOString().split('T')[0]);
    // Pre-fill with proposed amount as default reference, or existing settlement amount
    setActualAmountSpent(prop.settlementAmount ? String(prop.settlementAmount) : String(prop.amount || ''));
    setSettlementRemarks(prop.settlementRemarks || '');
    setSettlementError('');
  };

  // Submit Settlement Form
  const handleSubmitSettlement = async (e) => {
    e.preventDefault();
    setSettlementError('');

    if (!settlementProposal) return;

    const parsedAmount = Number(actualAmountSpent);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setSettlementError('Please enter a valid actual amount spent greater than ₹0.');
      return;
    }

    if (!settlementDate) {
      setSettlementError('Please select a valid settlement submission date.');
      return;
    }

    setIsSubmittingSettlement(true);
    try {
      const res = await submitFacultySettlement({
        proposalId: settlementProposal.dbId || settlementProposal.id,
        actualAmount: parsedAmount,
        submissionDate: settlementDate,
        remarks: settlementRemarks.trim()
      });

      if (res.success) {
        setSettlementProposal(null);
      } else {
        setSettlementError(res.error || 'Failed to submit settlement.');
      }
    } catch (err) {
      setSettlementError(err.message || 'Error communicating with server.');
    } finally {
      setIsSubmittingSettlement(false);
    }
  };

  return (
    <FacultyLayout pageTitle="My Proposals">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-heading)', margin: 0 }}>
              My Budget Proposals
            </h1>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, marginBottom: 0 }}>
              Track the evaluation, approval, and settlement status of your submitted CSE department budget proposals.
            </p>
          </div>

          <button
            onClick={() => navigate('/faculty/proposal/new')}
            className="cbm-btn cbm-btn-primary"
            style={{ height: 34 }}
          >
            <Plus size={15} />
            <span>New Proposal</span>
          </button>
        </div>

        {/* Proposals Register Section */}
        <section className="cbm-section">
          <div className="cbm-section-header">
            <div>
              <h2 className="cbm-section-title">Submitted Proposals Register</h2>
              <p className="cbm-section-subtitle">
                Complete live register of department proposals submitted under your account
              </p>
            </div>

            <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-muted)' }}>
              {filteredProposals.length} Proposals Recorded
            </div>
          </div>

          {/* Search bar */}
          <div style={{ marginBottom: 10, maxWidth: 340, width: '100%', position: 'relative' }}>
            <Search
              size={14}
              style={{
                position: 'absolute',
                left: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--slate-400)'
              }}
            />
            <input
              type="text"
              placeholder="Search reference no, event, category, status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="cbm-input"
              style={{ height: 34, paddingLeft: 32, fontSize: 12.5 }}
            />
          </div>

          {/* Proposals Table with exact required columns:
              1. Reference number
              2. Event name
              3. Category
              4. Subcategory
              5. Original proposed amount
              6. Proposal status
              7. Settlement status
              8. Fill Settlement Form action
          */}
          <div className="cbm-table-container">
            <table className="cbm-table">
              <thead>
                <tr>
                  <th style={{ width: '15%' }}>Reference Number</th>
                  <th style={{ width: '22%' }}>Event Name</th>
                  <th style={{ width: '14%' }}>Category</th>
                  <th style={{ width: '13%' }}>Subcategory</th>
                  <th style={{ width: '11%', textAlign: 'right' }}>Proposed Amount</th>
                  <th style={{ width: '10%' }}>Proposal Status</th>
                  <th style={{ width: '15%' }}>Settlement Status</th>
                  <th style={{ width: '15%', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <TableSkeleton rows={4} columns={8} />
                ) : filteredProposals.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '16px 14px', color: 'var(--text-muted)' }}>
                      <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
                        No matching proposals found.
                      </p>
                      <button
                        onClick={() => navigate('/faculty/proposal/new')}
                        className="cbm-btn cbm-btn-outline cbm-btn-sm"
                      >
                        Create New Proposal
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredProposals.map((prop) => {
                    const normStatus = String(prop.status || '').toLowerCase();
                    const isAccepted = ['accepted', 'approved'].includes(normStatus);
                    const isRejected = normStatus === 'rejected';
                    const isEventDone = isEventCompleted(prop);

                    const normSettlementStatus = String(prop.settlementStatus || '').toLowerCase();
                    const isSettled = normSettlementStatus === 'settled';
                    const isPendingSettlement = normSettlementStatus === 'pending_settlement';

                    // Eligibility for Fill Settlement Form:
                    // Must be accepted AND event completed AND not already settled AND not pending review
                    const canFillSettlement = isAccepted && isEventDone && !isSettled && !isPendingSettlement;

                    return (
                      <tr key={prop.dbId || prop.id}>
                        {/* 1. Reference Number */}
                        <td style={{ fontWeight: 700, color: 'var(--primary)', fontFamily: 'monospace', fontSize: 12 }}>
                          {prop.proposalNumber || prop.proposalId || prop.id}
                        </td>

                        {/* 2. Event Name */}
                        <td style={{ fontWeight: 600, color: 'var(--text-heading)' }}>
                          <div>{prop.title || '—'}</div>
                          {prop.programDate && (
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400, marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Calendar size={11} /> {prop.programDate}
                            </div>
                          )}
                        </td>

                        {/* 3. Category */}
                        <td style={{ color: 'var(--text-body)', fontWeight: 500 }}>
                          {prop.category || '—'}
                        </td>

                        {/* 4. Subcategory */}
                        <td style={{ color: 'var(--text-body)' }}>
                          {prop.subCategory ? (
                            <span style={{ fontSize: 12, padding: '2px 6px', borderRadius: 4, backgroundColor: 'var(--slate-100)', color: 'var(--slate-700)', fontWeight: 500 }}>
                              {prop.subCategory}
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>
                          )}
                        </td>

                        {/* 5. Original Proposed Amount */}
                        <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--text-heading)', fontSize: 13 }}>
                          ₹{Number(prop.amount || 0).toLocaleString('en-IN')}
                        </td>

                        {/* 6. Proposal Status */}
                        <td>
                          <Badge status={prop.status} />
                          {isRejected && prop.rejectedAt && (
                            <div style={{ fontSize: 10, color: 'var(--danger-text)', marginTop: 2 }}>
                              24h retention
                            </div>
                          )}
                        </td>

                        {/* 7. Settlement Status */}
                        <td>
                          {isSettled ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4,
                                  fontSize: 11,
                                  fontWeight: 700,
                                  color: '#0369A1',
                                  backgroundColor: '#E0F2FE',
                                  padding: '2px 6px',
                                  borderRadius: 4,
                                  width: 'fit-content'
                                }}
                              >
                                <CheckCircle2 size={11} /> Settled
                              </span>
                              <span style={{ fontSize: 11.5, fontWeight: 700, color: '#0369A1' }}>
                                ₹{Number(prop.settlementAmount || 0).toLocaleString('en-IN')}
                              </span>
                            </div>
                          ) : isPendingSettlement ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4,
                                  fontSize: 11,
                                  fontWeight: 700,
                                  color: '#92400E',
                                  backgroundColor: '#FEF3C7',
                                  padding: '2px 6px',
                                  borderRadius: 4,
                                  width: 'fit-content'
                                }}
                              >
                                <Clock size={11} /> Pending Review
                              </span>
                              {prop.settlementAmount && (
                                <span style={{ fontSize: 11, color: '#92400E', fontWeight: 600 }}>
                                  Claimed: ₹{Number(prop.settlementAmount).toLocaleString('en-IN')}
                                </span>
                              )}
                            </div>
                          ) : isAccepted ? (
                            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                              {isEventDone ? 'Awaiting Settlement' : 'Event Upcoming'}
                            </span>
                          ) : (
                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>—</span>
                          )}
                        </td>

                        {/* 8. Actions (Fill Settlement Form + Details) */}
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
                            {canFillSettlement && (
                              <button
                                onClick={() => handleOpenSettlement(prop)}
                                className="cbm-btn cbm-btn-primary cbm-btn-sm"
                                style={{
                                  height: 28,
                                  padding: '0 8px',
                                  fontSize: 11.5,
                                  fontWeight: 700,
                                  backgroundColor: '#0284C7',
                                  borderColor: '#0284C7',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4
                                }}
                                title="Submit actual expenditure settlement for this completed event"
                              >
                                <Receipt size={12} />
                                <span>Fill Settlement</span>
                              </button>
                            )}

                            {isAccepted && !isEventDone && !isSettled && !isPendingSettlement && (
                              <span
                                style={{
                                  fontSize: 10.5,
                                  padding: '3px 6px',
                                  borderRadius: 3,
                                  backgroundColor: 'var(--slate-100)',
                                  color: 'var(--slate-500)',
                                  fontWeight: 600
                                }}
                                title="Settlement form becomes available after event date"
                              >
                                Event Upcoming
                              </span>
                            )}

                            <button
                              onClick={() => setSelectedProposal(prop)}
                              style={{
                                padding: '3px 8px',
                                borderRadius: 'var(--radius-sm)',
                                backgroundColor: 'var(--bg-surface)',
                                color: 'var(--text-body)',
                                border: '1px solid var(--border)',
                                fontWeight: 600,
                                fontSize: 11.5,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                cursor: 'pointer',
                                height: 28
                              }}
                              title="View full proposal details"
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

        {/* SETTLEMENT FORM MODAL */}
        {settlementProposal && (
          <div onClick={() => setSettlementProposal(null)} className="cbm-modal-backdrop">
            <div
              onClick={(e) => e.stopPropagation()}
              className="cbm-modal-content"
              style={{ maxWidth: 520, padding: '16px 20px' }}
            >
              {/* Modal Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Receipt size={18} color="var(--primary)" />
                  <div>
                    <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: 'var(--text-heading)' }}>
                      Fill Settlement Form
                    </h2>
                    <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                      Reconcile actual expenditure for finalized proposal
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSettlementProposal(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}
                >
                  <X size={18} />
                </button>
              </div>

              {settlementError && (
                <div
                  style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--danger-bg)',
                    border: '1px solid var(--danger-border)',
                    color: 'var(--danger-text)',
                    fontSize: 12.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    marginBottom: 12
                  }}
                  role="alert"
                >
                  <AlertTriangle size={15} style={{ flexShrink: 0 }} />
                  <span>{settlementError}</span>
                </div>
              )}

              <form onSubmit={handleSubmitSettlement} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* Read-Only Populated Proposal Details */}
                <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-sm)', backgroundColor: '#FAFAFA', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                    Proposal Details (Read-Only)
                  </span>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Reference Number:</span>
                      <p style={{ margin: '1px 0 0 0', fontSize: 12.5, fontWeight: 700, color: 'var(--primary)', fontFamily: 'monospace' }}>
                        {settlementProposal.proposalNumber || settlementProposal.proposalId || settlementProposal.id}
                      </p>
                    </div>

                    <div>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Category / Subcategory:</span>
                      <p style={{ margin: '1px 0 0 0', fontSize: 12.5, fontWeight: 600, color: 'var(--text-heading)' }}>
                        {settlementProposal.category}
                        {settlementProposal.subCategory ? ` / ${settlementProposal.subCategory}` : ''}
                      </p>
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Event Name:</span>
                      <p style={{ margin: '1px 0 0 0', fontSize: 13, fontWeight: 600, color: 'var(--text-heading)' }}>
                        {settlementProposal.title}
                      </p>
                    </div>

                    <div>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Event Date:</span>
                      <p style={{ margin: '1px 0 0 0', fontSize: 12.5, fontWeight: 500, color: 'var(--text-body)' }}>
                        {settlementProposal.programDate || '—'}
                      </p>
                    </div>

                    <div>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Original Proposed Amount:</span>
                      <p style={{ margin: '1px 0 0 0', fontSize: 15, fontWeight: 800, color: 'var(--text-heading)' }}>
                        ₹{Number(settlementProposal.amount || 0).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Faculty Input: Settlement Date */}
                <div className="cbm-input-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="settlement-date-input" className="cbm-label" style={{ fontSize: 12.5 }}>
                    Settlement Submission Date <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <input
                    id="settlement-date-input"
                    type="date"
                    value={settlementDate}
                    onChange={(e) => setSettlementDate(e.target.value)}
                    required
                    className="cbm-input"
                    style={{ height: 38, fontSize: 13 }}
                  />
                </div>

                {/* Faculty Input: Actual Amount Spent */}
                <div className="cbm-input-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="settlement-amount-input" className="cbm-label" style={{ fontSize: 12.5 }}>
                    Actual Amount Spent (₹) <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <input
                    id="settlement-amount-input"
                    type="number"
                    min="1"
                    step="any"
                    value={actualAmountSpent}
                    onChange={(e) => setActualAmountSpent(e.target.value)}
                    placeholder="e.g. 12500"
                    required
                    className="cbm-input"
                    style={{ height: 38, fontSize: 14, fontWeight: 700, color: '#0369A1' }}
                  />
                  {settlementProposal && actualAmountSpent && !isNaN(Number(actualAmountSpent)) && (
                    <div style={{ marginTop: 4, fontSize: 11.5 }}>
                      {Number(actualAmountSpent) > Number(settlementProposal.amount || 0) ? (
                        <span style={{ color: '#D97706', fontWeight: 600 }}>
                          ⚠ Expenditure exceeds proposed amount by ₹{(Number(actualAmountSpent) - Number(settlementProposal.amount || 0)).toLocaleString('en-IN')}. Subject to administrative review.
                        </span>
                      ) : Number(actualAmountSpent) < Number(settlementProposal.amount || 0) ? (
                        <span style={{ color: '#059669', fontWeight: 600 }}>
                          ✓ Savings of ₹{(Number(settlementProposal.amount || 0) - Number(actualAmountSpent)).toLocaleString('en-IN')} will be restored to category balance upon approval.
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>
                          Expenditure exactly matches original proposed amount.
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Faculty Input: Remarks */}
                <div className="cbm-input-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="settlement-remarks-input" className="cbm-label" style={{ fontSize: 12.5 }}>
                    Expenditure Remarks / Bills Summary <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>(Optional)</span>
                  </label>
                  <input
                    id="settlement-remarks-input"
                    type="text"
                    value={settlementRemarks}
                    onChange={(e) => setSettlementRemarks(e.target.value)}
                    placeholder="e.g. Honorarium voucher #412 and travel bill verified"
                    className="cbm-input"
                    style={{ height: 38, fontSize: 12.5 }}
                  />
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
                  <button
                    type="button"
                    onClick={() => setSettlementProposal(null)}
                    disabled={isSubmittingSettlement}
                    className="cbm-btn cbm-btn-outline"
                    style={{ height: 34, fontSize: 12.5 }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmittingSettlement}
                    className="cbm-btn cbm-btn-primary"
                    style={{ height: 34, fontSize: 12.5, backgroundColor: '#0284C7', borderColor: '#0284C7' }}
                  >
                    {isSubmittingSettlement ? 'Submitting...' : 'Submit Settlement Form'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* FULL PROPOSAL DETAILS MODAL */}
        {selectedProposal && (
          <div onClick={() => setSelectedProposal(null)} className="cbm-modal-backdrop">
            <div
              onClick={(e) => e.stopPropagation()}
              className="cbm-modal-content"
              style={{ maxWidth: 540 }}
            >
              {/* Modal Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Proposal Record Details
                  </span>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-heading)', marginTop: 2 }}>
                    {selectedProposal.proposalNumber || selectedProposal.proposalId || selectedProposal.id}
                  </h2>
                </div>
                <Badge status={selectedProposal.status} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* Academic Year and Proposal Date */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: 12, paddingBottom: 8, borderBottom: '1px solid var(--border-subtle)' }}>
                  <div>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Academic Year</span>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-heading)', marginTop: 1 }}>
                      {selectedProposal.academicYear || '—'}
                    </p>
                  </div>

                  <div>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Proposal Date</span>
                    <p style={{ fontSize: 13, color: 'var(--text-body)', marginTop: 1 }}>
                      {selectedProposal.proposalDate || '—'}
                    </p>
                  </div>
                </div>

                {/* Program Title */}
                <div style={{ paddingBottom: 8, borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Program Title</span>
                  <p style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-heading)', marginTop: 1 }}>
                    {selectedProposal.title || '—'}
                  </p>
                </div>

                {/* Category and Program Date */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: 12, paddingBottom: 8, borderBottom: '1px solid var(--border-subtle)' }}>
                  <div>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Category</span>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-body)', marginTop: 1 }}>
                      {selectedProposal.category || '—'}
                      {selectedProposal.subCategory ? ` — ${selectedProposal.subCategory}` : ''}
                    </p>
                  </div>

                  <div>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Program Date</span>
                    <p style={{ fontSize: 13, color: 'var(--text-body)', marginTop: 1 }}>
                      {selectedProposal.programDate || '—'}
                    </p>
                  </div>
                </div>

                {/* Letter ID & Document Link if any */}
                {(selectedProposal.eventDetails?.letterId ||
                  selectedProposal.eventDetails?.documentDetails?.letterId ||
                  selectedProposal.eventDetails?.documentDetails?.fileName ||
                  selectedProposal.eventDetails?.documentDetails?.driveUrl) && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: 12, paddingBottom: 8, borderBottom: '1px solid var(--border-subtle)' }}>
                    <div>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Sanction Letter ID</span>
                      <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-heading)', marginTop: 1 }}>
                        {selectedProposal.eventDetails?.letterId || selectedProposal.eventDetails?.documentDetails?.letterId || '—'}
                      </p>
                    </div>

                    <div>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Document</span>
                      <p style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--primary)', marginTop: 1 }}>
                        {selectedProposal.eventDetails?.documentDetails?.driveUrl ? (
                          <a
                            href={selectedProposal.eventDetails.documentDetails.driveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: 'var(--primary)', textDecoration: 'underline' }}
                          >
                            📄 View Google Drive File
                          </a>
                        ) : selectedProposal.eventDetails?.documentDetails?.fileName ? (
                          `📄 ${selectedProposal.eventDetails.documentDetails.fileName}`
                        ) : (
                          'No document attached'
                        )}
                      </p>
                    </div>
                  </div>
                )}

                {/* Financial Details (Separating Proposed Amount from Settlement Amount) */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: selectedProposal.settlementStatus === 'settled' || selectedProposal.settlementAmount ? '1fr 1fr' : '1fr',
                    gap: 12,
                    backgroundColor: 'var(--slate-50)',
                    padding: 12,
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)'
                  }}
                >
                  <div>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Original Proposed Amount</span>
                    <p style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-heading)', marginTop: 2 }}>
                      ₹{Number(selectedProposal.amount || 0).toLocaleString('en-IN')}
                    </p>
                  </div>

                  {(selectedProposal.settlementStatus === 'settled' || selectedProposal.settlementAmount) && (
                    <div>
                      <span style={{ fontSize: 11, color: '#0369A1', textTransform: 'uppercase', fontWeight: 700 }}>
                        {selectedProposal.settlementStatus === 'settled' ? 'Finalized Settlement' : 'Submitted Settlement'}
                      </span>
                      <p style={{ fontSize: 18, fontWeight: 800, color: '#0369A1', marginTop: 2 }}>
                        ₹{Number(selectedProposal.settlementAmount || 0).toLocaleString('en-IN')}
                      </p>
                    </div>
                  )}
                </div>

                {/* Settlement remarks */}
                {selectedProposal.settlementRemarks && (
                  <div style={{ padding: '8px 12px', borderRadius: 'var(--radius-sm)', backgroundColor: '#F0F9FF', border: '1px solid #BAE6FD' }}>
                    <span style={{ fontSize: 11, color: '#0369A1', textTransform: 'uppercase', fontWeight: 700 }}>
                      Settlement Remarks
                    </span>
                    <p style={{ margin: '2px 0 0 0', fontSize: 12.5, color: '#0369A1' }}>
                      {selectedProposal.settlementRemarks}
                    </p>
                  </div>
                )}

                {/* Admin Remarks */}
                {selectedProposal.adminRemarks && (
                  <div style={{ padding: '10px 12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--gold-subtle)', border: '1px solid var(--gold-border)', marginTop: 4 }}>
                    <span style={{ fontSize: 11, color: 'var(--gold-text)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
                      Admin Review Remarks
                    </span>
                    <p style={{ fontSize: 12.5, color: 'var(--text-heading)', marginTop: 2, lineHeight: 1.4 }}>
                      {selectedProposal.adminRemarks}
                    </p>
                  </div>
                )}
              </div>

              {/* Close Modal */}
              <button
                onClick={() => setSelectedProposal(null)}
                style={{
                  width: '100%',
                  padding: 8,
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
